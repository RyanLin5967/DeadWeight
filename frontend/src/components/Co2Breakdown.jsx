import { formatBytes } from '../utils/formatBytes'

export default function Co2Breakdown({ data }) {
  const KWH_PER_GB = 0.81
  const CO2_PER_KWH = 442

  const bytesToCo2 = (bytes) => {
    const gb = bytes / 1073741824
    return Math.round(gb * KWH_PER_GB * CO2_PER_KWH * 1000) / 1000
  }

  const categories = [
    { name: 'Unused CSS', icon: '🎨', bytes: data.css.reduce((s, r) => s + r.wastedBytes, 0), color: '#d4a843' },
    { name: 'Unused JavaScript', icon: '⚙️', bytes: data.js.reduce((s, r) => s + r.wastedBytes, 0), color: '#d98a5a' },
    { name: 'Oversized images', icon: '🖼️', bytes: data.images.reduce((s, r) => s + r.estimatedSavings, 0), color: '#d9735a' },
    { name: 'Unused fonts', icon: '🔤', bytes: data.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0), color: '#a87fd9' },
  ].filter(c => c.bytes > 0)

  if (categories.length === 0) return null

  const totalWasteCo2 = bytesToCo2(data.totalWaste)
  const maxCo2 = Math.max(...categories.map(c => bytesToCo2(c.bytes)))

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">🏭 CO₂ by waste category</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 space-y-4">
        {categories.map(cat => {
          const co2 = bytesToCo2(cat.bytes)
          const barWidth = maxCo2 > 0 ? (co2 / maxCo2) * 100 : 0
          const monthlyPageviews = data.co2.monthlyPageviews
          const annualKg = Math.round((co2 * monthlyPageviews * 12) / 1000 * 10) / 10

          return (
            <div key={cat.name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#c8e0c8]">{cat.icon} {cat.name}</span>
                <span className="text-[#8a9e8a]">
                  {co2}g per visit · {annualKg} kg/year
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0a120a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-grow"
                  style={{ width: `${barWidth}%`, backgroundColor: cat.color }}
                />
              </div>
              <p className="text-[#4a5e4a] text-xs mt-1">
                {formatBytes(cat.bytes)} of waste → {co2}g CO₂ per visit
              </p>
            </div>
          )
        })}

        <div className="border-t border-[#1e2e1e] pt-4 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#c8e0c8] font-medium">Total waste emissions</span>
            <span className="text-[#d9735a] font-semibold">{totalWasteCo2}g per visit</span>
          </div>
        </div>
      </div>
    </div>
  )
}