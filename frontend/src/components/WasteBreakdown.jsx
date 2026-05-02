import { formatBytes } from '../utils/formatBytes'

export default function WasteBreakdown({ data }) {
  const categories = [
    { name: 'CSS', icon: '🎨', used: data.css.reduce((s, r) => s + r.usedBytes, 0), wasted: data.css.reduce((s, r) => s + r.wastedBytes, 0) },
    { name: 'JavaScript', icon: '⚙️', used: data.js.reduce((s, r) => s + r.usedBytes, 0), wasted: data.js.reduce((s, r) => s + r.wastedBytes, 0) },
    { name: 'Images', icon: '🖼️', used: data.images.reduce((s, r) => s + r.actualSize - r.estimatedSavings, 0), wasted: data.images.reduce((s, r) => s + r.estimatedSavings, 0) },
    { name: 'Fonts', icon: '🔤', used: data.fonts.filter(f => f.used).reduce((s, r) => s + r.size, 0), wasted: data.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0) },
  ].filter(c => c.used + c.wasted > 0)

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">Waste by category</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 space-y-5">
        {categories.map((cat) => {
          const total = cat.used + cat.wasted
          const usedPercent = total > 0 ? (cat.used / total) * 100 : 0
          const wastedPercent = total > 0 ? Math.round((cat.wasted / total) * 100) : 0
          return (
            <div key={cat.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#c8e0c8]">{cat.icon} {cat.name}</span>
                <span className="text-[#6a8a6a]">
                  {formatBytes(cat.used)} used · {formatBytes(cat.wasted)} wasted · <span className={wastedPercent > 50 ? 'text-[#d9735a]' : 'text-[#d4a843]'}>{wastedPercent}% waste</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0a120a] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#7fba6a] h-full animate-grow"
                  style={{ width: `${usedPercent}%` }}
                />
                <div
                  className="bg-[#d9735a] h-full animate-grow"
                  style={{ width: `${100 - usedPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}