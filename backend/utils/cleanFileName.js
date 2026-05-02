const TYPE_NAMES = {
  js: 'script',
  css: 'stylesheet',
  woff2: 'font',
  woff: 'font',
  ttf: 'font',
  otf: 'font',
  eot: 'font',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  svg: 'image',
};

function cleanFileName(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) return parsed.hostname;

    const rawFileName = parts[parts.length - 1].split('?')[0];
    const lastDotIndex = rawFileName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? rawFileName.substring(lastDotIndex + 1) : '';
    const nameWithoutExt = lastDotIndex !== -1 ? rawFileName.substring(0, lastDotIndex) : rawFileName;

    const segments = nameWithoutExt.split(/[-._]+/);
    const clean = [];

    segments.forEach(seg => {
      if (seg.length < 2) return;
      if (/^[a-z]{2,}$/.test(seg)) { clean.push(seg); return; }
      if (/^[A-Z][a-z]{2,}$/.test(seg)) { clean.push(seg.toLowerCase()); return; }
    });

    const cleanName = clean.length > 0
      ? clean.join('-')
      : TYPE_NAMES[ext] || 'file';

    const displayName = ext ? cleanName + '.' + ext : cleanName;

    const dirs = parts.slice(0, -1).filter(seg => {
      if (/^[a-f0-9]{8,}$/i.test(seg)) return false;
      if (/^[A-F0-9]{8}-[A-F0-9]{4}-/i.test(seg)) return false;
      if (seg.startsWith('_')) return false;
      return true;
    });

    const dirPath = dirs.slice(-2).join('/');

    if (dirPath) {
      return dirPath + '/' + displayName;
    }
    return displayName;

  } catch {
    return url.substring(0, 50);
  }
}

// Call this after cleaning all filenames to add numbers to duplicates
function deduplicateNames(items, nameKey = 'fileName') {
  const counts = {};
  const seen = {};

  // First pass — count occurrences
  items.forEach(item => {
    const name = item[nameKey];
    counts[name] = (counts[name] || 0) + 1;
  });

  // Second pass — add numbers to duplicates
  items.forEach(item => {
    const name = item[nameKey];
    if (counts[name] > 1) {
      seen[name] = (seen[name] || 0) + 1;
      const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
      const base = name.includes('.') ? name.substring(0, name.lastIndexOf('.')) : name;
      item[nameKey] = base + '-' + seen[name] + ext;
    }
  });

  return items;
}

module.exports = { cleanFileName, deduplicateNames };