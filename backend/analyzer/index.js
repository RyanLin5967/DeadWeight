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

  // --- Scan the main page ---
  await page.coverage.startCSSCoverage();
  await page.coverage.startJSCoverage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    if (!err.message.includes('timeout')) {
      await browser.close();
      throw err;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  const cssCoverage = await page.coverage.stopCSSCoverage();
  const jsCoverage = await page.coverage.stopJSCoverage();

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

  // --- Find internal links and scan a few more pages ---
  const siteDomain = new URL(url).hostname;

  const internalLinks = await page.evaluate((domain) => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const unique = new Set();
    links.forEach(a => {
      try {
        const href = new URL(a.href);
        if (href.hostname === domain && href.pathname !== window.location.pathname) {
          unique.add(href.origin + href.pathname);
        }
      } catch {}
    });
    return Array.from(unique);
  }, siteDomain);

  // Pick up to 4 internal pages to scan for coverage
  const pagesToScan = internalLinks.slice(0, 4);
  const additionalCss = [];
  const additionalJs = [];

  for (const link of pagesToScan) {
    try {
      await page.coverage.startCSSCoverage();
      await page.coverage.startJSCoverage();
      await page.goto(link, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      const css = await page.coverage.stopCSSCoverage();
      const js = await page.coverage.stopJSCoverage();
      additionalCss.push(...css);
      additionalJs.push(...js);
    } catch {
      // Skip pages that fail
    }
  }

  await client.detach();
  await browser.close();

  // --- Merge coverage data across all scanned pages ---
  const mergedCss = mergeCoverage(cssCoverage, additionalCss);
  const mergedJs = mergeCoverage(jsCoverage, additionalJs);

  // Run all analyzers with merged coverage
  const cssReport = analyzeCss(mergedCss, networkRequests);
  const jsReport = analyzeJs(mergedJs, networkRequests);
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

  // Calculate essential bytes as the sum of what's actually used
  // rather than totalLoaded - waste, which is inconsistent
  const cssUsed = cssReport.reduce((sum, r) => sum + r.usedBytes, 0);
  const jsUsed = jsReport.reduce((sum, r) => sum + r.usedBytes, 0);
  const imageUsed = imageReport.reduce((sum, r) => sum + (r.actualSize - r.estimatedSavings), 0);
  const fontUsed = fontReport.filter(f => f.used).reduce((sum, r) => sum + r.size, 0);

  // Add the HTML document itself and any non-CSS/JS/image/font requests
  const analyzedUrls = new Set([
    ...cssReport.map(r => r.url),
    ...jsReport.map(r => r.url),
    ...imageReport.map(r => r.url),
    ...fontReport.map(r => r.url),
  ]);
  const otherBytes = networkRequests
    .filter(r => !analyzedUrls.has(r.url))
    .reduce((sum, r) => sum + r.size, 0);

  const essentialBytes = cssUsed + jsUsed + imageUsed + fontUsed + otherBytes;
  const clampedWaste = Math.min(totalWaste, totalLoaded);
  const wastePercent = totalLoaded > 0 ? Math.round((clampedWaste / totalLoaded) * 100) : 0;

  const co2Report = calculateCo2(totalLoaded, essentialBytes);

  return {
    url,
    pagesScanned: 1 + pagesToScan.length,
    totalLoaded,
    essentialBytes,
    totalWaste: clampedWaste,
    wastePercent,
    css: cssReport,
    js: jsReport,
    images: imageReport,
    fonts: fontReport,
    thirdParty: thirdPartyReport,
    co2: co2Report,
    totalRequests: networkRequests.length,
  };
}

// Merge coverage from multiple pages — union of all used ranges per file
function mergeCoverage(primary, additional) {
  // Build a map of URL -> coverage entry
  const merged = new Map();

  // Start with primary page coverage
  for (const entry of primary) {
    merged.set(entry.url, {
      url: entry.url,
      text: entry.text,
      ranges: [...entry.ranges],
    });
  }

  // Union in additional page coverage
  for (const entry of additional) {
    if (merged.has(entry.url)) {
      // Same file seen on another page — union the ranges
      const existing = merged.get(entry.url);
      existing.ranges = unionRanges(existing.ranges, entry.ranges);
    }
    // If we haven't seen this file on the main page, skip it —
    // we only care about files the main page loaded
  }

  return Array.from(merged.values());
}

// Union two arrays of {start, end} ranges into a minimal set of non-overlapping ranges
function unionRanges(rangesA, rangesB) {
  const all = [...rangesA, ...rangesB].sort((a, b) => a.start - b.start);
  if (all.length === 0) return [];

  const result = [all[0]];
  for (let i = 1; i < all.length; i++) {
    const last = result[result.length - 1];
    if (all[i].start <= last.end) {
      last.end = Math.max(last.end, all[i].end);
    } else {
      result.push({ ...all[i] });
    }
  }
  return result;
}

module.exports = analyze;