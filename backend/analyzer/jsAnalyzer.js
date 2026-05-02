function analyzeJs(jsCoverage) {
  return jsCoverage.map(entry => {
    const totalBytes = entry.text.length;
    const usedBytes = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
    const wastedBytes = totalBytes - usedBytes;
    const wastedPercent = totalBytes > 0 ? Math.round((wastedBytes / totalBytes) * 100) : 0;
    const fileName = entry.url.split('/').pop().split('?')[0] || 'inline-script';

    return {
      url: entry.url,
      fileName,
      totalBytes,
      usedBytes,
      wastedBytes,
      wastedPercent,
      fix: wastedPercent > 50
        ? `Consider code splitting. ${wastedPercent}% of this script never executed on this page.`
        : wastedPercent > 20
        ? `Minor JS cleanup possible. ${wastedPercent}% never executed.`
        : null,
    };
  }).filter(entry => entry.wastedBytes > 500);
}

module.exports = analyzeJs;