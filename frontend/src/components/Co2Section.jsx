export default function Co2Section({ data }) {
  const { co2 } = data

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">🌱 Environmental impact</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">CO₂ per visit (current)</p>
            <p className="text-3xl font-bold text-[#e8f0e8]">{co2.co2PerVisit}<span className="text-lg text-[#6a8a6a] ml-1">g</span></p>
          </div>
          <div>
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">CO₂ per visit (optimized)</p>
            <p className="text-3xl font-bold text-[#7fba6a]">{co2.co2PerVisitSlim}<span className="text-lg text-[#4a8a3a] ml-1">g</span></p>
          </div>
        </div>

        <div className="border-t border-[#1e2e1e] pt-5 space-y-3">
          <p className="text-[#8a9e8a] text-sm leading-relaxed">
            At <span className="text-[#c8e0c8] font-medium">{co2.monthlyPageviews.toLocaleString()}</span> monthly pageviews, this page produces an estimated{' '}
            <span className="text-[#e8f0e8] font-semibold">{co2.annualCo2} kg</span> of CO₂ per year.
          </p>
          <p className="text-[#8a9e8a] text-sm leading-relaxed">
            Fixing the identified waste would save{' '}
            <span className="text-[#7fba6a] font-semibold">{co2.annualSavings} kg</span> of CO₂ annually.
          </p>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-[#0a120a] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#7fba6a]">{co2.equivalents.carKm.toLocaleString()}</p>
              <p className="text-[#5a6e5a] text-xs mt-1">km of driving saved</p>
            </div>
            <div className="flex-1 bg-[#0a120a] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#7fba6a]">{co2.equivalents.phoneCharges.toLocaleString()}</p>
              <p className="text-[#5a6e5a] text-xs mt-1">phone charges saved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}