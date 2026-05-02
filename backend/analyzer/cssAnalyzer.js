const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

function analyzeCss(cssCoverage, networkRequests) {
  const results = cssCoverage.map(entry => {
    const uncompressedTotal = entry.text.length;
    const uncompressedUsed = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
    const wastedPercent = uncompressedTotal > 0 ? (uncompressedTotal - uncompressedUsed) / uncompressedTotal : 0;

    const networkEntry = networkRequests.find(r => r.url === entry.url);
    const transferSize = networkEntry ? networkEntry.size : uncompressedTotal;

    const totalBytes = transferSize;
    const wastedBytes = Math.round(transferSize * wastedPercent);
    const usedBytes = totalBytes - wastedBytes;
    const wastedPercentRounded = Math.round(wastedPercent * 100);

    const fileName = cleanFileName(entry.url);

    return {
      url: entry.url,
      fileName,
      totalBytes,
      usedBytes,
      wastedBytes,
      wastedPercent: wastedPercentRounded,
      fix: wastedPercentRounded > 50
        ? `Audit and purge unused CSS rules. ${wastedPercentRounded}% of this stylesheet is not used on this page.`
        : wastedPercentRounded > 20
        ? `Minor CSS cleanup possible. ${wastedPercentRounded}% is unused.`
        : null,
    };
  }).filter(entry => entry.wastedBytes > 500);

  return deduplicateNames(results);
}

module.exports = analyzeCss;