function analyzeCss(cssCoverage) {
  return cssCoverage.map(entry => {
    const totalBytes = entry.text.length;
    const usedBytes = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
    const wastedBytes = totalBytes - usedBytes;
    const wastedPercent = totalBytes > 0 ? Math.round((wastedBytes / totalBytes) * 100) : 0;
    const fileName = entry.url.split('/').pop().split('?')[0] || 'inline-style';

    return {
      url: entry.url,
      fileName,
      totalBytes,
      usedBytes,
      wastedBytes,
      wastedPercent,
      fix: wastedPercent > 50
        ? `Audit and purge unused CSS rules. ${wastedPercent}% of this stylesheet is not used on this page.`
        : wastedPercent > 20
        ? `Minor CSS cleanup possible. ${wastedPercent}% is unused.`
        : null,
    };
  }).filter(entry => entry.wastedBytes > 500); // ignore tiny files
}

module.exports = analyzeCss;