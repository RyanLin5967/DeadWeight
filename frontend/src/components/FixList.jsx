import { formatBytes } from '../utils/formatBytes'

export default function FixList({ data }) {
  const fixes = []

  data.css.forEach(item => {
    if (item.fix) fixes.push({ type: 'css', fileName: item.fileName, savings: item.wastedBytes, fix: item.fix })
  })
  data.js.forEach(item => {
    if (item.fix) fixes.push({ type: 'js', fileName: item.fileName, savings: item.wastedBytes, fix: item.fix })
  })
  data.images.forEach(item => {
    if (item.fix) fixes.push({ type: 'image', fileName: item.fileName, savings: item.estimatedSavings, fix: item.fix })
  })
  data.fonts.forEach(item => {
    if (item.fix) fixes.push({ type: 'font', fileName: item.fileName, savings: item.size, fix: item.fix })
  })
  data.thirdParty.fixes.forEach(fix => {
    fixes.push({ type: 'third-party', fileName: 'Third-party scripts', savings: 0, fix })
  })

  fixes.sort((a, b) => b.savings - a.savings)

  const icons = { css: '🎨', js: '⚙️', image: '🖼️', font: '🔤', 'third-party': '🌐' }
  const typeColors = {
    css: 'border-l-[#d4a843]',
    js: 'border-l-[#d98a5a]',
    image: 'border-l-[#d9735a]',
    font: 'border-l-[#a87fd9]',
    'third-party': 'border-l-[#5a9ed9]',
  }

  if (fixes.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">Recommendations</h2>
        <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-8 text-center">
          <p className="text-[#7fba6a] text-lg">🌿 This page is already pretty lean!</p>
          <p className="text-[#5a6e5a] text-sm mt-2">No major issues found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">
        Recommendations
        <span className="text-[#5a6e5a] text-sm font-normal ml-2">({fixes.length} issues)</span>
      </h2>
      <div className="space-y-2.5">
        {fixes.slice(0, 15).map((item, i) => (
          <div key={i} className={`bg-[#111a11] border border-[#1e2e1e] border-l-4 ${typeColors[item.type]} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{icons[item.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-[#c8e0c8] truncate">{item.fileName}</span>
                  {item.savings > 0 && (
                    <span className="text-xs font-semibold text-[#d9735a] bg-[#2a1515] px-2 py-0.5 rounded-full">
                      −{formatBytes(item.savings)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6a8a6a] mt-1">{item.fix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}