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
    fixes.push({ type: 'third-party', fileName: 'Third-party', savings: 0, fix })
  })

  fixes.sort((a, b) => b.savings - a.savings)

  if (fixes.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <p className="text-zinc-500">This page is already pretty lean. No major issues found.</p>
      </div>
    )
  }

  const icons = { css: '🎨', js: '⚙️', image: '🖼️', font: '🔤', 'third-party': '🌐' }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
      <div className="space-y-3">
        {fixes.slice(0, 15).map((item, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">{icons[item.type]}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-300">{item.fileName}</span>
                  {item.savings > 0 && (
                    <span className="text-xs text-red-400">−{formatBytes(item.savings)}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{item.fix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}