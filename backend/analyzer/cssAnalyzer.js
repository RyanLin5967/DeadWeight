const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

const KNOWN_STYLESHEETS = [
  { pattern: /bootstrap/i, name: 'Bootstrap CSS', suggestion: 'Use only the Bootstrap components you need, or replace with a few lines of custom CSS for your layout.' },
  { pattern: /font-?awesome/i, name: 'Font Awesome', suggestion: 'Loading the full icon library for a few icons. Use individual SVG icons instead, or import only the icons you need.' },
  { pattern: /tailwind/i, name: 'Tailwind CSS', suggestion: 'Ensure PurgeCSS is configured to remove unused utility classes in production builds.' },
  { pattern: /bulma/i, name: 'Bulma', suggestion: 'Import only the Bulma modules you use instead of the full framework.' },
  { pattern: /materialize/i, name: 'Materialize CSS', suggestion: 'Consider replacing with a lighter framework or custom CSS if only using a few components.' },
  { pattern: /animate\.css/i, name: 'Animate.css', suggestion: 'Only import the animations you use, not the full library.' },
  { pattern: /normalize/i, name: 'Normalize.css', suggestion: 'Modern browsers need less normalization. Consider replacing with a minimal CSS reset.' },
];

function analyzeCss(cssCoverage, networkRequests) {
  const results = cssCoverage.map(entry => {
    const uncompressedTotal = entry.text.length;
    const uncompressedUsed = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
    const wastedPercent = uncompressedTotal > 0 ? (uncompressedTotal - uncompressedUsed) / uncompressedTotal : 0;

    const networkEntry = networkRequests.find(r => r.url === entry.url);
    const transferSize = networkEntry ? networkEntry.size : uncompressedTotal;

    const effectiveWastedPercent = wastedPercent > 0.9 ? 1 : wastedPercent;

    const totalBytes = transferSize;
    const wastedBytes = Math.round(transferSize * effectiveWastedPercent);
    const usedBytes = totalBytes - wastedBytes;
    const wastedPercentRounded = Math.round(effectiveWastedPercent * 100);

    const fileName = cleanFileName(entry.url);

    const knownLib = KNOWN_STYLESHEETS.find(lib => lib.pattern.test(entry.url) || lib.pattern.test(fileName));

    let fix = null;
    if (knownLib) {
      if (wastedPercentRounded >= 100) {
        fix = `${knownLib.name} is loaded but essentially unused on this page. Remove it entirely. ${knownLib.suggestion}`;
      } else if (wastedPercentRounded > 50) {
        fix = `${knownLib.name}: ${wastedPercentRounded}% unused on this page. ${knownLib.suggestion}`;
      } else if (wastedPercentRounded > 20) {
        fix = `${knownLib.name}: minor cleanup possible (${wastedPercentRounded}% unused). ${knownLib.suggestion}`;
      }
    } else {
      if (wastedPercentRounded >= 100) {
        fix = `This stylesheet is loaded but essentially unused on this page. Remove it or defer loading.`;
      } else if (wastedPercentRounded > 50) {
        fix = `${wastedPercentRounded}% of this stylesheet is unused. Audit your CSS rules — most selectors on this page don't match any elements.`;
      } else if (wastedPercentRounded > 20) {
        fix = `Minor CSS cleanup possible — ${wastedPercentRounded}% of rules are unused on this page.`;
      }
    }

    return {
      url: entry.url,
      fileName,
      totalBytes,
      usedBytes,
      wastedBytes,
      wastedPercent: wastedPercentRounded,
      fix,
    };
  }).filter(entry => entry.wastedBytes > 500);

  return deduplicateNames(results);
}

module.exports = analyzeCss;