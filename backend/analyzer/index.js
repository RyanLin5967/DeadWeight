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
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  await page.setCacheEnabled(false);

  const networkRequests = [];
  const client = await page.createCDPSession();
  await client.send('Network.enable');

  const responseBodies = new Map();

  client.on('Network.responseReceived', (event) => {
    const { response, requestId } = event;
    const reqUrl = response.url;
    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
    const contentLength = parseInt(response.headers['content-length'] || response.headers['Content-Length'] || '0', 10);

    responseBodies.set(requestId, {
      url: reqUrl,
      contentType,
      size: contentLength,
      domain: (() => { try { return new URL(reqUrl).hostname; } catch { return ''; } })(),
    });
  });

  client.on('Network.loadingFinished', (event) => {
    const { requestId, encodedDataLength } = event;
    if (responseBodies.has(requestId)) {
      const entry = responseBodies.get(requestId);
      if (encodedDataLength > 0) {
        entry.size = encodedDataLength;
      }
      networkRequests.push(entry);
    }
  });

  await page.coverage.startCSSCoverage();
  await page.coverage.startJSCoverage();

  // Navigate — catch timeout but still continue with whatever loaded
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    if (!err.message.includes('timeout')) {
      await browser.close();
      throw err;
    }
    // Timeout is fine — we still have partial data, keep going
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const cssCoverage = await page.coverage.stopCSSCoverage();
  const jsCoverage = await page.coverage.stopJSCoverage();

  const imageData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.clientWidth,
      displayHeight: img.clientHeight,
    }));
  });

  // Query DOM for used fonts — use document.fonts API for accurate data
  const fontData = await page.evaluate(() => {
    const loadedFonts = [];
    document.fonts.forEach(font => {
      loadedFonts.push({
        family: font.family.replace(/['"]/g, '').toLowerCase(),
        status: font.status, // 'loaded' means it was actually used and rendered
      });
    });

    // Also get computed styles as a fallback
    const computedFamilies = new Set();
    document.querySelectorAll('*').forEach(el => {
      const fontFamily = getComputedStyle(el).fontFamily;
      fontFamily.split(',').forEach(f => {
        computedFamilies.add(f.trim().replace(/['"]/g, '').toLowerCase());
      });
    });

    return {
      loadedFonts,
      computedFamilies: Array.from(computedFamilies),
    };
  });

  await client.detach();
  await browser.close();

  const siteDomain = new URL(url).hostname;

  // Pass network requests to CSS and JS analyzers so they can use real transfer sizes
  const cssReport = analyzeCss(cssCoverage, networkRequests);
  const jsReport = analyzeJs(jsCoverage, networkRequests);
  const imageReport = analyzeImages(imageData, networkRequests);
  const fontReport = analyzeFonts(networkRequests, fontData);
  const thirdPartyReport = analyzeThirdParty(networkRequests, siteDomain);

  const totalLoaded = networkRequests.reduce((sum, r) => sum + r.size, 0);
  const totalCssWaste = cssReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalJsWaste = jsReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalImageWaste = imageReport.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const totalFontWaste = fontReport.filter(f => !f.used).reduce((sum, r) => sum + r.size, 0);

  const totalWaste = totalCssWaste + totalJsWaste + totalImageWaste + totalFontWaste;

  // Clamp so waste never exceeds total loaded
  const clampedWaste = Math.min(totalWaste, totalLoaded);
  const essentialBytes = totalLoaded - clampedWaste;

  const co2Report = calculateCo2(totalLoaded, essentialBytes);

  return {
    url,
    totalLoaded,
    essentialBytes,
    totalWaste: clampedWaste,
    wastePercent: totalLoaded > 0 ? Math.round((clampedWaste / totalLoaded) * 100) : 0,
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