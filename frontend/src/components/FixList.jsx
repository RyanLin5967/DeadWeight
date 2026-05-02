import { useState } from 'react'
import { formatBytes } from '../utils/formatBytes'

export default function FixList({ fixes }) {
  const [isOpen, setIsOpen] = useState(false)

  const icons = { css: '🎨', js: '⚙️', image: '🖼️', font: '🔤', 'third-party': '🌐' }
  const typeColors = {
    css: 'border-l-[#d4a843]',
    js: 'border-l-[#d98a5a]',
    image: 'border-l-[#d9735a]',
    font: 'border-l-[#a87fd9]',
    'third-party': 'border-l-[#5a9ed9]',
  }

  const totalSavings = fixes.reduce((s, f) => s + f.savings, 0)

  if (fixes.length === 0) {
    return (
      <div className="mb-8">
        <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 text-center">
          <p className="text-[#7fba6a] text-lg">🌿 This page is already pretty lean!</p>
          <p className="text-[#5a6e5a] text-sm mt-2">No major issues found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-[#151f15] transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-[#c8e0c8]">Recommendations</h2>
          <span className="text-[#5a6e5a] text-sm">
            {fixes.length} issue{fixes.length > 1 ? 's' : ''} · {formatBytes(totalSavings)} saveable
          </span>
        </div>
        <span className={`text-[#6a8a6a] text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2.5">
          <p className="text-[#4a5e4a] text-xs px-1">
            Coverage is measured for this page and up to 4 linked pages. Shared bundles may still contain code used elsewhere.
          </p>
          {fixes.slice(0, 15).map((item) => (
            <div
              key={item.id}
              className={`bg-[#111a11] border border-[#1e2e1e] border-l-4 ${typeColors[item.type]} rounded-xl p-4`}
            >
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
      )}
    </div>
  )
}