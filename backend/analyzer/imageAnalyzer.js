const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

function analyzeImages(imageData, networkRequests) {
  const results = imageData
    .filter(img => img.naturalWidth > 0 && img.displayWidth > 0)
    .map(img => {
      const networkEntry = networkRequests.find(r => r.url === img.src);
      const actualSize = networkEntry ? networkEntry.size : 0;

      if (actualSize === 0) return null;

      const scaleFactor = (img.naturalWidth * img.naturalHeight) / (img.displayWidth * img.displayHeight);
      const estimatedOptimalSize = Math.round(actualSize / scaleFactor);
      const estimatedSavings = scaleFactor > 2 ? actualSize - estimatedOptimalSize : 0;

      const fileName = cleanFileName(img.src);
      const format = img.src.split('.').pop().split('?')[0].toLowerCase();
      const isOldFormat = ['png', 'jpg', 'jpeg', 'bmp'].includes(format);

      let fix = null;
      if (scaleFactor > 10) {
        fix = `This image is massively oversized — it's ${img.naturalWidth}×${img.naturalHeight} but only displayed at ${img.displayWidth}×${img.displayHeight} (${Math.round(scaleFactor)}x more pixels than needed). Resize to match the display size and save ~${formatBytes(estimatedSavings)}.`;
        if (isOldFormat) fix += ` Also convert from ${format.toUpperCase()} to WebP for further savings.`;
      } else if (scaleFactor > 2) {
        fix = `Image is ${img.naturalWidth}×${img.naturalHeight} but displayed at ${img.displayWidth}×${img.displayHeight}. Resize to match and save ~${formatBytes(estimatedSavings)}.`;
        if (isOldFormat) fix += ` Convert to WebP for additional savings.`;
      } else if (isOldFormat && actualSize > 100000) {
        fix = `This ${format.toUpperCase()} image (${formatBytes(actualSize)}) could be smaller as WebP — typically 25-35% savings with no visible quality loss.`;
      }

      return {
        url: img.src,
        fileName,
        actualSize,
        displayDimensions: `${img.displayWidth}×${img.displayHeight}`,
        naturalDimensions: `${img.naturalWidth}×${img.naturalHeight}`,
        scaleFactor: Math.round(scaleFactor * 10) / 10,
        estimatedSavings,
        format,
        fix,
      };
    })
    .filter(entry => entry !== null && (entry.estimatedSavings > 1000 || entry.fix));

  return deduplicateNames(results);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = analyzeImages;