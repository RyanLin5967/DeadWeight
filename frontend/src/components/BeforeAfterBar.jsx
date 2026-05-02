import { formatBytes } from '../utils/formatBytes'

export default function BeforeAfterBar({ data }) {
  const cssWasted = data.css.reduce((s, r) => s + r.wastedBytes, 0)
  const jsWasted = data.js.reduce((s, r) => s + r.wastedBytes, 0)
  const imgWasted = data.images.reduce((s, r) => s + r.estimatedSavings, 0)
  const fontWasted = data.fonts.filter(f => !f.used).reduce((s, r) => s + r.size, 0)
  const thirdParty = data.thirdParty.totalThirdPartyBytes

  const segments = [
    { label: 'Essential', bytes: data.essentialBytes, color: '#7fba6a' },
    { label: 'Unused CSS', bytes: cssWasted, color: '#d4a843' },
    { label: 'Unused JS', bytes: jsWasted, color: '#d98a5a' },
    { label: 'Oversized images', bytes: imgWasted, color: '#d9735a' },
    { label: 'Unused fonts', bytes: fontWasted, color: '#a87fd9' },
    { label: 'Third-party', bytes: thirdParty, color: '#5a9ed9' },
  ].filter(s => s.bytes > 0)

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">Page composition</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6">
        <div className="w-full h-8 rounded-full overflow-hidden flex bg-[#0a120a]">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="h-full animate-grow transition-all"
              style={{
                width: `${(seg.bytes / data.totalLoaded) * 100}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.label}: ${formatBytes(seg.bytes)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 text-sm text-[#8a9e8a]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span>{seg.label}: {formatBytes(seg.bytes)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}