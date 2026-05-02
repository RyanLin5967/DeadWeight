function analyzeFonts(networkRequests, usedFonts) {
  const fontFiles = networkRequests.filter(r => {
    const url = r.url.toLowerCase();
    const contentType = r.contentType.toLowerCase();
    return contentType.includes('font') ||
      url.endsWith('.woff2') ||
      url.endsWith('.woff') ||
      url.endsWith('.ttf') ||
      url.endsWith('.otf') ||
      url.endsWith('.eot');
  });

  return fontFiles.map(font => {
    const fileName = font.url.split('/').pop().split('?')[0];

    // Extract a rough font family name from the filename
    // e.g., "Roboto-Bold.woff2" -> "roboto"
    const namePart = fileName.split('.')[0]
      .replace(/[-_](regular|bold|italic|light|medium|semibold|thin|black|extra|condensed|expanded)/gi, '')
      .toLowerCase()
      .trim();

    const used = usedFonts.some(f => f.toLowerCase().includes(namePart));

    return {
      url: font.url,
      fileName,
      size: font.size,
      used,
      fix: !used
        ? `This font is loaded but never rendered on this page. Remove it to save ${formatBytes(font.size)}.`
        : null,
    };
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = analyzeFonts;