export default function Impact({ data }) {
  const annualWasteCo2 = data.co2.annualCo2 - data.co2.annualCo2Slim // kg saved if fixed
  const annualTotalCo2 = data.co2.annualCo2

  if (annualTotalCo2 <= 0) return null

  // All per-year equivalents based on total site emissions
  const trees = Math.max(1, Math.round(annualTotalCo2 / 21)) // avg tree absorbs ~21kg CO2/year
  const flights = Math.round((annualTotalCo2 / 255) * 10) / 10 // Toronto to Vancouver ~255kg
  const netflixHours = Math.round(annualTotalCo2 / 0.036) // ~36g per hour of streaming
  const googleSearches = Math.round(annualTotalCo2 * 1000 / 0.2) // ~0.2g per search
  const lightbulbDays = Math.round(annualTotalCo2 / 0.029) // 10W LED ~29g/day
  const smartphoneYears = Math.round((annualTotalCo2 / 5) * 10) / 10 // ~5kg to charge a phone for a year
  const boiledKettles = Math.round(annualTotalCo2 * 1000 / 15) // ~15g per kettle boil

  const equivalents = [
    { value: trees, unit: trees === 1 ? 'tree' : 'trees', detail: 'needed to absorb this CO₂ per year', icon: '🌳' },
    { value: netflixHours.toLocaleString(), unit: 'hours', detail: 'of Netflix streaming equivalent', icon: '📺' },
    { value: googleSearches.toLocaleString(), unit: 'Google searches', detail: 'worth of emissions', icon: '🔍' },
    { value: lightbulbDays.toLocaleString(), unit: 'days', detail: 'of running an LED lightbulb', icon: '💡' },
    { value: smartphoneYears, unit: smartphoneYears === 1 ? 'year' : 'years', detail: 'of charging a smartphone', icon: '📱' },
    { value: boiledKettles.toLocaleString(), unit: 'kettles', detail: 'of water boiled', icon: '☕' },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 text-[#c8e0c8]">🌍 What {data.co2.annualCo2} kg of CO₂ looks like</h2>
      <p className="text-[#5a6e5a] text-sm mb-4">
        At {data.co2.monthlyPageviews.toLocaleString()} monthly pageviews, this site produces the same emissions as:
      </p>
      <div className="grid grid-cols-3 gap-3">
        {equivalents.map((eq, i) => (
          <div key={i} className="bg-[#111a11] border border-[#1e2e1e] rounded-xl p-4 text-center">
            <span className="text-2xl">{eq.icon}</span>
            <p className="text-2xl font-bold text-[#e8f0e8] mt-2">{eq.value}</p>
            <p className="text-[#7fba6a] text-sm font-medium">{eq.unit}</p>
            <p className="text-[#4a5e4a] text-xs mt-1">{eq.detail}</p>
          </div>
        ))}
      </div>
      {annualWasteCo2 > 0 && (
        <div className="bg-[#122212] border border-[#2a4a2a] rounded-xl p-4 mt-4 text-center">
          <p className="text-[#a3d98f] text-sm">
            By fixing the identified waste, you could eliminate <span className="font-semibold text-[#7fba6a]">{Math.round((annualWasteCo2 / annualTotalCo2) * 100)}%</span> of these emissions
            — saving <span className="font-semibold text-[#7fba6a]">{Math.round(annualWasteCo2 * 10) / 10} kg</span> of CO₂ per year.
            That's <span className="font-semibold text-[#7fba6a]">{Math.max(1, Math.round(annualWasteCo2 / 21))} fewer {Math.round(annualWasteCo2 / 21) === 1 ? 'tree' : 'trees'}</span> needed to offset your site.
          </p>
        </div>
      )}
    </div>
  )
}