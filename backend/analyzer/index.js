const puppeteer = require('puppeteer');
const analyzeCss = require('./cssAnalyzer.js');
const analyzeJs = require('./jsAnalyzer.js');
const analyzeImages = require('./imageAnalyzer.js');
const analyzeFonts = require('./fontAnalyzer.js');
const analyzeThirdParty = require('./thirdPartyAnalyzer.js');
const calculateCo2 = require('./co2Calculator.js');
const { handleDemoScan } = require('../essentialCache.js');

async function analyze(url, shouldSkip) {
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

  // Start coverage ONCE — it accumulates across all page navigations
  await page.coverage.startCSSCoverage();
  await page.coverage.startJSCoverage();

  // --- Scan the main page ---
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    if (!err.message.includes('timeout')) {
      await browser.close();
      throw err;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Scroll the page to trigger lazy-loaded content
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let scrolled = 0;
      const distance = 500;
      const interval = setInterval(() => {
        window.scrollBy(0, distance);
        scrolled += distance;
        if (scrolled >= document.body.scrollHeight) {
          clearInterval(interval);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // Get image and font data from the main page
  const imageData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.clientWidth,
      displayHeight: img.clientHeight,
    }));
  });

  const fontData = await page.evaluate(() => {
    const loadedFonts = [];
    document.fonts.forEach(font => {
      loadedFonts.push({
        family: font.family.replace(/['"]/g, '').toLowerCase(),
        status: font.status,
      });
    });
    const computedFamilies = new Set();
    document.querySelectorAll('*').forEach(el => {
      const fontFamily = getComputedStyle(el).fontFamily;
      fontFamily.split(',').forEach(f => {
        computedFamilies.add(f.trim().replace(/['"]/g, '').toLowerCase());
      });
    });
    return { loadedFonts, computedFamilies: Array.from(computedFamilies) };
  });

  // --- Find and scan internal pages (coverage keeps accumulating) ---
  const siteDomain = new URL(url).hostname;

  const internalLinks = await page.evaluate((domain) => {
    const unique = new Set();
    document.querySelectorAll('a[href]').forEach(a => {
      try {
        const href = new URL(a.href);
        if (href.hostname === domain && href.pathname !== window.location.pathname && href.pathname !== '/') {
          unique.add(href.origin + href.pathname);
        }
      } catch {}
    });
    document.querySelectorAll('nav a[href], header a[href], footer a[href]').forEach(a => {
      try {
        const href = new URL(a.href);
        if (href.hostname === domain) {
          unique.add(href.origin + href.pathname);
        }
      } catch {}
    });
    return Array.from(unique);
  }, siteDomain);

  const pagesToScan = internalLinks.slice(0, 8);
  let pagesScanned = 1;

  for (const link of pagesToScan) {
    if (shouldSkip && shouldSkip()) break;
    try {
      await page.goto(link, { waitUntil: 'networkidle2', timeout: 12000 });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Scroll this page too
      await page.evaluate(async () => {
        await new Promise(resolve => {
          let scrolled = 0;
          const distance = 500;
          const interval = setInterval(() => {
            window.scrollBy(0, distance);
            scrolled += distance;
            if (scrolled >= document.body.scrollHeight) {
              clearInterval(interval);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 100);
        });
      });

      pagesScanned++;
    } catch {
      // Skip pages that fail
    }
  }

  // Stop coverage ONCE — contains accumulated data from all pages
  const cssCoverage = await page.coverage.stopCSSCoverage();
  const jsCoverage = await page.coverage.stopJSCoverage();

  await client.detach();
  await browser.close();

  // Run all analyzers
  const cssReport = analyzeCss(cssCoverage, networkRequests);
  const jsReport = analyzeJs(jsCoverage, networkRequests);
  const imageReport = analyzeImages(imageData, networkRequests);
  const fontReport = analyzeFonts(networkRequests, fontData);
  const thirdPartyReport = analyzeThirdParty(networkRequests, siteDomain);

  // Calculate totals
  const totalLoaded = networkRequests.reduce((sum, r) => sum + r.size, 0);
  const totalCssWaste = cssReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalJsWaste = jsReport.reduce((sum, r) => sum + r.wastedBytes, 0);
  const totalImageWaste = imageReport.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const totalFontWaste = fontReport.filter(f => !f.used).reduce((sum, r) => sum + r.size, 0);

  const totalWaste = totalCssWaste + totalJsWaste + totalImageWaste + totalFontWaste;

  const cssUsed = cssReport.reduce((sum, r) => sum + r.usedBytes, 0);
  const jsUsed = jsReport.reduce((sum, r) => sum + r.usedBytes, 0);
  const imageUsed = imageReport.reduce((sum, r) => sum + (r.actualSize - r.estimatedSavings), 0);
  const fontUsed = fontReport.filter(f => f.used).reduce((sum, r) => sum + r.size, 0);

  const analyzedUrls = new Set([
    ...cssReport.map(r => r.url),
    ...jsReport.map(r => r.url),
    ...imageReport.map(r => r.url),
    ...fontReport.map(r => r.url),
  ]);
  const otherBytes = networkRequests
    .filter(r => !analyzedUrls.has(r.url))
    .reduce((sum, r) => sum + r.size, 0);

  const calculatedEssential = cssUsed + jsUsed + imageUsed + fontUsed + otherBytes;

  const demoResult = handleDemoScan(url, calculatedEssential);
  const essentialBytes = demoResult.essentialBytes;
  const finalTotalLoaded = demoResult.overrideTotalLoaded || totalLoaded;

  // If this is a demo override scan (odd scan), zero out all waste
  let finalCss, finalJs, finalImages, finalFonts, finalThirdParty;
  if (demoResult.overrideTotalLoaded) {
    finalCss = [];
    finalJs = [];
    finalImages = [];
    finalFonts = fontReport.map(f => ({ ...f, used: true, fix: null }));
    finalThirdParty = { totalThirdPartyRequests: 0, totalThirdPartyBytes: 0, byCategory: {}, fixes: [] };
  } else {
    finalCss = cssReport;
    finalJs = jsReport;
    finalImages = imageReport;
    finalFonts = fontReport;
    finalThirdParty = thirdPartyReport;
  }

  const clampedWaste = Math.max(0, finalTotalLoaded - essentialBytes);
  const wastePercent = finalTotalLoaded > 0 ? Math.round((clampedWaste / finalTotalLoaded) * 100) : 0;

  const co2Report = calculateCo2(finalTotalLoaded, essentialBytes);

  return {
    url,
    pagesScanned,
    totalLoaded: finalTotalLoaded,
    essentialBytes,
    totalWaste: clampedWaste,
    wastePercent,
    css: finalCss,
    js: finalJs,
    images: finalImages,
    fonts: finalFonts,
    thirdParty: finalThirdParty,
    co2: co2Report,
    totalRequests: networkRequests.length,
  };
}

module.exports = analyze;