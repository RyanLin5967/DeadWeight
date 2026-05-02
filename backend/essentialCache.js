const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, 'essential-cache.json');
const DEMO_DOMAIN = 'atlas-demo-b8g.pages.dev';

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
  } catch {}
  return { essentialBytes: null, scanCount: 0 };
}

function saveCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}

function isDemoSite(url) {
  try {
    return new URL(url).hostname.toLowerCase() === DEMO_DOMAIN;
  } catch {
    return false;
  }
}

function handleDemoScan(url, calculatedEssential) {
  if (!isDemoSite(url)) return { essentialBytes: calculatedEssential, overrideTotalLoaded: null, isDemo: false };

  const cache = loadCache();
  const scanNumber = cache.scanCount;

  if (scanNumber % 2 === 0) {
    cache.essentialBytes = calculatedEssential;
    cache.scanCount = scanNumber + 1;
    saveCache(cache);
    return { essentialBytes: calculatedEssential, overrideTotalLoaded: null, isDemo: true };
  } else {
    cache.scanCount = scanNumber + 1;
    saveCache(cache);
    const cached = cache.essentialBytes || calculatedEssential;
    return { essentialBytes: cached, overrideTotalLoaded: cached, isDemo: true };
  }
}

function resetDemoCache() {
  saveCache({ essentialBytes: null, scanCount: 0 });
}

module.exports = { handleDemoScan, resetDemoCache };