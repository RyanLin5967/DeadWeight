export default function Co2Section({ data }) {
  const { co2 } = data

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Environmental impact</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-zinc-500 text-sm mb-1">CO₂ per visit (current)</p>
            <p className="text-2xl font-bold">{co2.co2PerVisit}g</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">CO₂ per visit (if fixed)</p>
            <p className="text-2xl font-bold text-emerald-400">{co2.co2PerVisitSlim}g</p>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-zinc-400 text-sm">
            At {co2.monthlyPageviews.toLocaleString()} monthly pageviews, this page produces an estimated{' '}
            <span className="text-white font-semibold">{co2.annualCo2} kg</span> of CO₂ per year.
            Fixing the waste would save <span className="text-emerald-400 font-semibold">{co2.annualSavings} kg</span> annually
            — equivalent to driving {co2.equivalents.carKm.toLocaleString()} km or charging a phone{' '}
            {co2.equivalents.phoneCharges.toLocaleString()} times.
          </p>
        </div>
      </div>
    </div>
  )
}