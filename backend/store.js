const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'snapshots.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {
    // corrupted file, start fresh
  }
  return {};
}

function saveStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

// key = normalized URL hostname+pathname
function getKey(url) {
  try {
    const parsed = new URL(url);
    return (parsed.hostname + parsed.pathname).replace(/\/+$/, '').toLowerCase();
  } catch {
    return url;
  }
}

function saveSnapshot(url, report) {
  const store = loadStore();
  const key = getKey(url);

  if (!store[key]) {
    store[key] = { url, snapshots: [] };
  }

  store[key].snapshots.push({
    timestamp: new Date().toISOString(),
    totalLoaded: report.totalLoaded,
    essentialBytes: report.essentialBytes,
    totalWaste: report.totalWaste,
    wastePercent: report.wastePercent,
    totalRequests: report.totalRequests,
    co2PerVisit: report.co2.co2PerVisit,
    annualCo2: report.co2.annualCo2,
    cssWaste: report.css.reduce((s, r) => s + r.wastedBytes, 0),
    jsWaste: report.js.reduce((s, r) => s + r.wastedBytes, 0),
    imageWaste: report.images.reduce((s, r) => s + r.estimatedSavings, 0),
    fontWaste: report.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0),
    thirdPartyBytes: report.thirdParty.totalThirdPartyBytes,
    issueCount: report.css.filter(r => r.fix).length +
      report.js.filter(r => r.fix).length +
      report.images.filter(r => r.fix).length +
      report.fonts.filter(r => r.fix).length +
      report.thirdParty.fixes.length,
  });

  saveStore(store);
  return store[key];
}

function getSnapshots(url) {
  const store = loadStore();
  const key = getKey(url);
  return store[key] || null;
}

function getAllSites() {
  const store = loadStore();
  return Object.entries(store).map(([key, data]) => ({
    key,
    url: data.url,
    snapshotCount: data.snapshots.length,
    latest: data.snapshots[data.snapshots.length - 1],
  }));
}

function deleteSite(url) {
  const store = loadStore();
  const key = getKey(url);
  if (store[key]) {
    delete store[key];
    saveStore(store);
    return true;
  }
  return false;
}

module.exports = { saveSnapshot, getSnapshots, getAllSites, deleteSite };