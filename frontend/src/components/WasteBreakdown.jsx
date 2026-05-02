import { formatBytes } from '../utils/formatBytes'

export default function WasteBreakdown({ data }) {
  const categories = [
    {
      name: 'CSS',
      used: data.css.reduce((s, r) => s + r.usedBytes, 0),
      wasted: data.css.reduce((s, r) => s + r.wastedBytes, 0),
    },
    {
      name: 'JavaScript',
      used: data.js.reduce((s, r) => s + r.usedBytes, 0),
      wasted: data.js.reduce((s, r) => s + r.wastedBytes, 0),
    },
    {
      name: 'Images',
      used: data.images.reduce((s, r) => s + r.actualSize - r.estimatedSavings, 0),
      wasted: data.images.reduce((s, r) => s + r.estimatedSavings, 0),
    },
    {
      name: 'Fonts',
      used: data.fonts.filter(f => f.used).reduce((s, r) => s + r.size, 0),
      wasted: data.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0),
    },
  ].filter(c => c.used + c.wasted > 0)

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Waste by category</h2>
      <div className="space-y-4">
        {categories.map((cat) => {
          const total = cat.used + cat.wasted
          const wastedPercent = total > 0 ? Math.round((cat.wasted / total) * 100) : 0
          return (
            <div key={cat.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">{cat.name}</span>
                <span className="text-zinc-500">
                  {formatBytes(cat.used)} used / {formatBytes(cat.wasted)} wasted ({wastedPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${((cat.used / total) * 100)}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${((cat.wasted / total) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}