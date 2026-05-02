const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

function analyzeFonts(networkRequests, fontData) {
  const { loadedFonts, computedFamilies } = fontData;

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

  const renderedFamilies = loadedFonts
    .filter(f => f.status === 'loaded')
    .map(f => f.family);

  const results = fontFiles.map(font => {
    const fileName = cleanFileName(font.url);
    const urlLower = font.url.toLowerCase();

    const matchesRendered = renderedFamilies.some(family => {
      if (family.length < 3) return false;
      return urlLower.includes(family.replace(/\s+/g, ''));
    });

    const matchesComputed = computedFamilies.some(family => {
      if (family.length < 3) return false;
      return urlLower.includes(family.replace(/\s+/g, ''));
    });

    const rawFileName = font.url.split('/').pop().split('?')[0];
    const isHashedFilename = /^[a-f0-9]{16,}\./i.test(rawFileName);

    const used = matchesRendered || matchesComputed || isHashedFilename;

    return {
      url: font.url,
      fileName,
      size: font.size,
      used,
      fix: !used
        ? `This font is loaded but not rendered on this page. Remove it to save ${formatBytes(font.size)}.`
        : null,
    };
  });

  return deduplicateNames(results);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = analyzeFonts;