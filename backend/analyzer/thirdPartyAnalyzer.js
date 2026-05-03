const CATEGORIES = {
  analytics: ['google-analytics.com', 'googletagmanager.com', 'hotjar.com', 'mixpanel.com', 'segment.com', 'plausible.io', 'analytics.google.com', 'clarity.ms'],
  ads: ['doubleclick.net', 'googlesyndication.com', 'facebook.net', 'adnxs.com', 'amazon-adsystem.com', 'ads-twitter.com', 'outbrain.com', 'taboola.com'],
  social: ['platform.twitter.com', 'connect.facebook.net', 'platform.linkedin.com', 'platform.instagram.com'],
  fonts: ['fonts.googleapis.com', 'fonts.gstatic.com', 'use.typekit.net'],
  cdn: ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com', 'ajax.googleapis.com'],
};

function categorize(domain) {
  for (const [category, domains] of Object.entries(CATEGORIES)) {
    if (domains.some(d => domain.includes(d))) return category;
  }
  return 'other';
}

function analyzeThirdParty(networkRequests, siteDomain) {
  const thirdParty = networkRequests.filter(r => !r.domain.includes(siteDomain));

  const byCategory = {};
  for (const [cat] of Object.entries(CATEGORIES)) {
    byCategory[cat] = { count: 0, bytes: 0, domains: new Set() };
  }
  byCategory.other = { count: 0, bytes: 0, domains: new Set() };

  thirdParty.forEach(req => {
    const cat = categorize(req.domain);
    byCategory[cat].count++;
    byCategory[cat].bytes += req.size;
    byCategory[cat].domains.add(req.domain);
  });

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].domains = Array.from(byCategory[cat].domains);
  }

  const fixes = [];
  if (byCategory.analytics.bytes > 50000) {
    fixes.push(`Analytics scripts add ${formatBytes(byCategory.analytics.bytes)}. Consider if all tracking tools are necessary.`);
  }
  if (byCategory.ads.bytes > 50000) {
    fixes.push(`Ad-related requests add ${formatBytes(byCategory.ads.bytes)} across ${byCategory.ads.count} requests.`);
  }
  if (byCategory.social.bytes > 10000) {
    fixes.push(`Social widgets add ${formatBytes(byCategory.social.bytes)}. Consider replacing with simple link icons.`);
  }

  return {
    totalThirdPartyRequests: thirdParty.length,
    totalThirdPartyBytes: thirdParty.reduce((sum, r) => sum + r.size, 0),
    byCategory,
    fixes,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

module.exports = analyzeThirdParty;