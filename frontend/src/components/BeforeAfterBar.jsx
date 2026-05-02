import { formatBytes } from '../utils/formatBytes'

export default function BeforeAfterBar({ data }) {
  const cssUsed = data.css.reduce((s, r) => s + r.usedBytes, 0)
  const cssWasted = data.css.reduce((s, r) => s + r.wastedBytes, 0)
  const jsUsed = data.js.reduce((s, r) => s + r.usedBytes, 0)
  const jsWasted = data.js.reduce((s, r) => s + r.wastedBytes, 0)
  const imgWasted = data.images.reduce((s, r) => s + r.estimatedSavings, 0)
  const fontWasted = data.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0)
  const thirdParty = data.thirdParty.totalThirdPartyBytes

  const segments = [
    { label: 'Essential', bytes: data.essentialBytes, color: 'bg-emerald-500' },
    { label: 'Unused CSS', bytes: cssWasted, color: 'bg-yellow-500' },
    { label: 'Unused JS', bytes: jsWasted, color: 'bg-orange-500' },
    { label: 'Oversized images', bytes: imgWasted, color: 'bg-red-500' },
    { label: 'Unused fonts', bytes: fontWasted, color: 'bg-purple-500' },
    { label: 'Third-party', bytes: thirdParty, color: 'bg-blue-500' },
  ].filter(s => s.bytes > 0)

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Page composition</h2>
      <div className="w-full h-10 rounded-lg overflow-hidden flex">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} h-full`}
            style={{ width: `${(seg.bytes / data.totalLoaded) * 100}%` }}
            title={`${seg.label}: ${formatBytes(seg.bytes)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm text-zinc-400">
            <div className={`w-3 h-3 rounded-sm ${seg.color}`} />
            <span>{seg.label}: {formatBytes(seg.bytes)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}