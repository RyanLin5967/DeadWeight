const { cleanFileName, deduplicateNames } = require('../utils/cleanFileName.js');

const KNOWN_LIBRARIES = [
  { pattern: /jquery/i, name: 'jQuery', suggestion: 'Replace with vanilla JavaScript (document.querySelector, fetch, etc.). Modern browsers don\'t need jQuery.' },
  { pattern: /lodash/i, name: 'Lodash', suggestion: 'Import only the functions you use (e.g., lodash.debounce) instead of the full library, or replace with native array methods.' },
  { pattern: /moment/i, name: 'Moment.js', suggestion: 'Replace with a lighter alternative like day.js (7KB vs 300KB) or use native Intl.DateTimeFormat.' },
  { pattern: /chart\.js|chart\.umd/i, name: 'Chart.js', suggestion: 'Only import the chart types you use with tree-shakeable imports, or remove entirely if unused.' },
  { pattern: /bootstrap\.bundle|bootstrap\.min\.js/i, name: 'Bootstrap JS', suggestion: 'Import only the Bootstrap components you use, or remove entirely if you only need the CSS grid.' },
  { pattern: /popper/i, name: 'Popper.js', suggestion: 'Only needed if using Bootstrap dropdowns or tooltips. Remove if not using those components.' },
  { pattern: /gsap/i, name: 'GSAP', suggestion: 'Only load GSAP plugins you actually use. Remove unused plugins like ScrollTrigger if not scrolling-animated.' },
  { pattern: /three/i, name: 'Three.js', suggestion: 'This is a large 3D rendering library. Remove if not rendering 3D content on this page.' },
  { pattern: /react-dom/i, name: 'React DOM', suggestion: 'Ensure you\'re using production builds and consider lazy loading routes to reduce initial bundle size.' },
  { pattern: /analytics|gtag|gtm/i, name: 'Analytics', suggestion: 'Consider if all tracking scripts are necessary. Each one adds load time and privacy cost.' },
  { pattern: /hotjar/i, name: 'Hotjar', suggestion: 'Heatmap and session recording tool. Remove if not actively reviewing session data.' },
  { pattern: /intercom|drift|crisp/i, name: 'Chat widget', suggestion: 'Chat widgets often load 200KB+ of JavaScript. Consider lazy-loading it after user interaction.' },
  { pattern: /sentry/i, name: 'Sentry', suggestion: 'Error monitoring library. Consider lazy loading or sampling to reduce bundle impact.' },
];

function analyzeJs(jsCoverage, networkRequests) {
  const results = jsCoverage.map(entry => {
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

    // Check if this is a known library
    const knownLib = KNOWN_LIBRARIES.find(lib => lib.pattern.test(entry.url) || lib.pattern.test(fileName));

    let fix = null;
    if (knownLib) {
      if (wastedPercentRounded > 90) {
        fix = `${knownLib.name} is loaded but almost entirely unused (${wastedPercentRounded}% waste). Remove it entirely. ${knownLib.suggestion}`;
      } else if (wastedPercentRounded > 50) {
        fix = `${knownLib.name}: ${wastedPercentRounded}% of the code never executed. ${knownLib.suggestion}`;
      } else if (wastedPercentRounded > 20) {
        fix = `${knownLib.name}: minor cleanup possible (${wastedPercentRounded}% unused). ${knownLib.suggestion}`;
      }
    } else {
      if (wastedPercentRounded > 80) {
        fix = `${wastedPercentRounded}% of this script never executed. If this is a first-party bundle, consider code splitting to load only what this page needs.`;
      } else if (wastedPercentRounded > 50) {
        fix = `${wastedPercentRounded}% of this script is unused on this page. Consider splitting it into smaller, page-specific chunks.`;
      } else if (wastedPercentRounded > 20) {
        fix = `Minor optimization possible — ${wastedPercentRounded}% of this script didn't execute on this page.`;
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

module.exports = analyzeJs;