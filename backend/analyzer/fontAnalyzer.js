const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

function analyzeFonts(networkRequests, fontData) {
  const { loadedFonts, computedFamilies } = fontData;

  const fontFiles = networkRequests.filter(r => {
    const url = r.url.toLowerCase();
    const contentType = r.contentType.toLowerCase();

    // Must be an actual font file, not a CSS file that mentions fonts
    if (contentType.includes('css') || url.endsWith('.css')) return false;
    if (contentType.includes('javascript') || url.endsWith('.js')) return false;

    return contentType.includes('font') ||
      url.endsWith('.woff2') ||
      url.endsWith('.woff') ||
      url.endsWith('.ttf') ||
      url.endsWith('.otf') ||
      url.endsWith('.eot');
  });

  const renderedFamilies = loadedFonts
    .filter(f => f.status === 'loaded')
    .map(f => f.family.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ''));

  const unrenderedFamilies = loadedFonts
    .filter(f => f.status === 'unloaded')
    .map(f => f.family.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ''));

  const results = fontFiles.map(font => {
    const fileName = cleanFileName(font.url);
    // Normalize URL — remove hyphens and spaces for matching
    const urlNormalized = font.url.toLowerCase().replace(/[-_\s]/g, '');

    const matchesRendered = renderedFamilies.some(family => {
      if (family.length < 3) return false;
      return urlNormalized.includes(family);
    });

    const matchesUnrendered = unrenderedFamilies.some(family => {
      if (family.length < 3) return false;
      return urlNormalized.includes(family);
    });

    let used;
    if (matchesRendered) {
      used = true;
    } else if (matchesUnrendered) {
      used = false;
    } else {
      // Can't determine — assume used
      used = true;
    }

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