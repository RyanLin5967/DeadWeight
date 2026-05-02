import { useState } from 'react'

export default function Co2Section({ data }) {
  const [monthlyViews, setMonthlyViews] = useState(data.co2.monthlyPageviews)

  const KWH_PER_GB = 0.81
  const CO2_PER_KWH = 442

  const totalGB = data.totalLoaded / 1073741824
  const essentialGB = data.essentialBytes / 1073741824

  const co2PerVisit = Math.round(totalGB * KWH_PER_GB * CO2_PER_KWH * 100) / 100
  const co2PerVisitSlim = Math.round(essentialGB * KWH_PER_GB * CO2_PER_KWH * 100) / 100

  const annualCo2 = Math.round((co2PerVisit * monthlyViews * 12) / 1000 * 10) / 10
  const annualCo2Slim = Math.round((co2PerVisitSlim * monthlyViews * 12) / 1000 * 10) / 10
  const annualSavings = Math.round((annualCo2 - annualCo2Slim) * 10) / 10

  const carKm = Math.round(annualSavings * 5)
  const phoneCharges = Math.round(annualSavings * 136)

  const handleViewsChange = (e) => {
    const val = parseInt(e.target.value.replace(/,/g, ''), 10)
    if (!isNaN(val) && val >= 0) {
      setMonthlyViews(val)
    } else if (e.target.value === '') {
      setMonthlyViews(0)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">🌱 Environmental impact</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6">

        {/* Monthly pageviews input */}
        <div className="mb-6 pb-6 border-b border-[#1e2e1e]">
          <label className="text-[#6a8a6a] text-xs uppercase tracking-wider block mb-2">
            Monthly pageviews
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={monthlyViews.toLocaleString()}
              onChange={handleViewsChange}
              className="bg-[#0a120a] border border-[#2a3d2a] rounded-lg px-4 py-2 text-[#e8f0e8] text-lg w-48 outline-none focus:border-[#7fba6a] transition-colors"
            />
            <span className="text-[#5a6e5a] text-sm">visits/month</span>
          </div>
          <p className="text-[#4a5e4a] text-xs mt-2">Adjust to match your actual traffic for accurate CO₂ estimates</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">CO₂ per visit (current)</p>
            <p className="text-3xl font-bold text-[#e8f0e8]">{co2PerVisit}<span className="text-lg text-[#6a8a6a] ml-1">g</span></p>
          </div>
          <div>
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">CO₂ per visit (optimized)</p>
            <p className="text-3xl font-bold text-[#7fba6a]">{co2PerVisitSlim}<span className="text-lg text-[#4a8a3a] ml-1">g</span></p>
          </div>
        </div>

        <div className="border-t border-[#1e2e1e] pt-5 space-y-3">
          <p className="text-[#8a9e8a] text-sm leading-relaxed">
            At <span className="text-[#c8e0c8] font-medium">{monthlyViews.toLocaleString()}</span> monthly pageviews, this page produces an estimated{' '}
            <span className="text-[#e8f0e8] font-semibold">{annualCo2} kg</span> of CO₂ per year.
          </p>
          {annualSavings > 0 && (
            <p className="text-[#8a9e8a] text-sm leading-relaxed">
              Fixing the identified waste would save{' '}
              <span className="text-[#7fba6a] font-semibold">{annualSavings} kg</span> of CO₂ annually.
            </p>
          )}
          {annualSavings > 0 && (
            <div className="flex gap-4 mt-4">
              <div className="flex-1 bg-[#0a120a] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#7fba6a]">{carKm.toLocaleString()}</p>
                <p className="text-[#5a6e5a] text-xs mt-1">km of driving saved</p>
              </div>
              <div className="flex-1 bg-[#0a120a] rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#7fba6a]">{phoneCharges.toLocaleString()}</p>
                <p className="text-[#5a6e5a] text-xs mt-1">phone charges saved</p>
              </div>
            </div>
          )}
          {annualSavings <= 0 && (
            <div className="bg-[#0a120a] rounded-xl p-4 text-center mt-4">
              <p className="text-[#7fba6a]">🌿 This page produces minimal CO₂ — no significant savings available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}