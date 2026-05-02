function analyzeImages(imageData, networkRequests) {
  return imageData
    .filter(img => img.naturalWidth > 0 && img.displayWidth > 0)
    .map(img => {
      const networkEntry = networkRequests.find(r => r.url === img.src);
      const actualSize = networkEntry ? networkEntry.size : 0;

      if (actualSize === 0) return null;

      const scaleFactor = (img.naturalWidth * img.naturalHeight) / (img.displayWidth * img.displayHeight);
      const estimatedOptimalSize = Math.round(actualSize / scaleFactor);
      const estimatedSavings = scaleFactor > 2 ? actualSize - estimatedOptimalSize : 0;

      const format = img.src.split('.').pop().split('?')[0].toLowerCase();
      const isOldFormat = ['png', 'jpg', 'jpeg', 'bmp'].includes(format);

      let fix = null;
      if (scaleFactor > 2) {
        fix = `Resize from ${img.naturalWidth}×${img.naturalHeight} to ${img.displayWidth}×${img.displayHeight}.`;
        if (isOldFormat) fix += ` Convert to WebP for additional savings.`;
        fix += ` Estimated savings: ${formatBytes(estimatedSavings)}.`;
      } else if (isOldFormat && actualSize > 100000) {
        fix = `Convert from ${format.toUpperCase()} to WebP to reduce file size.`;
      }

      return {
        url: img.src,
        fileName: img.src.split('/').pop().split('?')[0] || 'image',
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
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = analyzeImages;