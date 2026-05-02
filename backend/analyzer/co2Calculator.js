function calculateCo2(totalBytes, essentialBytes, monthlyPageviews = 10000) {
  const KWH_PER_GB = 0.81;
  const CO2_PER_KWH = 442; // grams, global average grid intensity (IEA)

  const totalGB = totalBytes / 1073741824;
  const essentialGB = essentialBytes / 1073741824;

  const co2PerVisit = totalGB * KWH_PER_GB * CO2_PER_KWH;
  const co2PerVisitSlim = essentialGB * KWH_PER_GB * CO2_PER_KWH;

  const annualCo2 = (co2PerVisit * monthlyPageviews * 12) / 1000; // kg
  const annualCo2Slim = (co2PerVisitSlim * monthlyPageviews * 12) / 1000;
  const annualSavings = annualCo2 - annualCo2Slim;

  return {
    co2PerVisit: Math.round(co2PerVisit * 100) / 100,
    co2PerVisitSlim: Math.round(co2PerVisitSlim * 100) / 100,
    annualCo2: Math.round(annualCo2 * 10) / 10,
    annualCo2Slim: Math.round(annualCo2Slim * 10) / 10,
    annualSavings: Math.round(annualSavings * 10) / 10,
    monthlyPageviews,
    equivalents: {
      carKm: Math.round(annualSavings / 0.17), // avg car emits ~170g CO2 per km
      phoneCharges: Math.round(annualSavings / 0.0024), // ~2.4g CO2 per charge
    },
  };
}

module.exports = calculateCo2;