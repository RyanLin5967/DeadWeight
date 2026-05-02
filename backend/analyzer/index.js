const puppeteer = require('puppeteer');
const analyzeCss = require('./cssAnalyzer.js');
const analyzeJs = require('./jsAnalyzer.js');
const analyzeImages = require('./imageAnalyzer.js');
const analyzeFonts = require('./fontAnalyzer.js');
const analyzeThirdParty = require('./thirdPartyAnalyzer.js');
const calculateCo2 = require('./co2Calculator.js');

async function analyze(url) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  // Collect all network responses
  const networkRequests = [];
  page.on('response', async (response) => {
    try {
      const reqUrl = response.url();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      const contentLength = parseInt(headers['content-length'] || '0', 10);

      let size = contentLength;
      if (!size) {
        try {
          const buffer = await response.buffer();
          size = buffer.length;
        } catch {
          size = 0;
        }
      }

      networkRequests.push({
        url: reqUrl,
        contentType,
        size,
        domain: new URL(reqUrl).hostname,
      });
    } catch {}
  });

  //start coverage tracking
  await page.coverage.startCSSCoverage();
  await page.coverage.startJSCoverage();

  // go to the page
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // stop coverage tracking
  const cssCoverage = await page.coverage.stopCSSCoverage();
  const jsCoverage = await page.coverage.stopJSCoverage();

  // Query DOM for image data
  const imageData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.clientWidth,
      displayHeight: img.clientHeight,
    }));
  });

  // Query DOM for used fonts
  const usedFonts = await page.evaluate(() => {
    const fonts = new Set();
    document.querySelectorAll('*').forEach(el => {
      const fontFamily = getComputedStyle(el).fontFamily;
      fontFamily.split(',').forEach(f => {
        fonts.add(f.trim().replace(/['"]/g, '').toLowerCase());
      });
    });
    return Array.from(fonts);
  });

  await browser.close();

  // Get the domain of the analyzed site
  const siteDomain = new URL(url).hostname;

  // Run all analyzers
  const cssReport = analyzeCss(cssCoverage);
  const jsReport = analyzeJs(jsCoverage);
  const imageReport = analyzeImages(imageData, networkRequests);
  const fontReport = analyzeFonts(networkRequests, usedFonts);
  const thirdPartyReport = analyzeThirdParty(networkRequests, siteDomain);

  // Calculate totals
  const totalLoaded = networkRequests.reduce((sum, r) => sum + r.size, 0);
  const totalCssWaste = cssReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalJsWaste = jsReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalImageWaste = imageReport.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const totalFontWaste = fontReport.filter(f => !f.used).reduce((sum, r) => sum + r.size, 0);
  const totalThirdParty = thirdPartyReport.totalThirdPartyBytes;

  const totalWaste = totalCssWaste + totalJsWaste + totalImageWaste + totalFontWaste;
  const essentialBytes = totalLoaded - totalWaste;

  const co2Report = calculateCo2(totalLoaded, essentialBytes);

  return {
    url,
    totalLoaded,
    essentialBytes,
    totalWaste,
    wastePercent: Math.round((totalWaste / totalLoaded) * 100),
    css: cssReport,
    js: jsReport,
    images: imageReport,
    fonts: fontReport,
    thirdParty: thirdPartyReport,
    co2: co2Report,
    totalRequests: networkRequests.length,
  };
}

module.exports = analyze;