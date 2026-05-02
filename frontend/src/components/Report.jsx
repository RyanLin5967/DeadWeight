import { useState, useMemo } from 'react'
import SummaryCard from './SummaryCard'
import BeforeAfterBar from './BeforeAfterBar'
import WasteBreakdown from './WasteBreakdown'
import FixList from './FixList'
import Co2Section from './Co2Section'
import { formatBytes } from '../utils/formatBytes'
import LeafIcon from './LeafIcon'

export default function Report({ data, onReset, onViewDashboard }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveSnapshot = async () => {
    setSaving(true)
    try {
      await fetch('http://localhost:3001/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url, report: data }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save snapshot:', err)
    }
    setSaving(false)
  }

  const allFixes = useMemo(() => {
    const fixes = []
    data.css.forEach((item, i) => {
      if (item.fix) fixes.push({ id: `css-${i}`, type: 'css', fileName: item.fileName, savings: item.wastedBytes, fix: item.fix })
    })
    data.js.forEach((item, i) => {
      if (item.fix) fixes.push({ id: `js-${i}`, type: 'js', fileName: item.fileName, savings: item.wastedBytes, fix: item.fix })
    })
    data.images.forEach((item, i) => {
      if (item.fix) fixes.push({ id: `img-${i}`, type: 'image', fileName: item.fileName, savings: item.estimatedSavings, fix: item.fix })
    })
    data.fonts.forEach((item, i) => {
      if (item.fix) fixes.push({ id: `font-${i}`, type: 'font', fileName: item.fileName, savings: item.size, fix: item.fix })
    })
    data.thirdParty.fixes.forEach((fix, i) => {
      fixes.push({ id: `tp-${i}`, type: 'third-party', fileName: 'Third-party scripts', savings: 0, fix })
    })
    fixes.sort((a, b) => b.savings - a.savings)
    return fixes
  }, [data])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <LeafIcon size={48} />
          <div>
            <h1 className="text-2xl font-bold text-[#e8f0e8]">Dead<span className="text-[#7fba6a]">Weight</span></h1>
            <p className="text-[#5a6e5a] text-sm break-all mt-0.5">{data.url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveSnapshot}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300
              ${saved
                ? 'bg-[#1a3a1a] border border-[#2a4a2a] text-[#7fba6a]'
                : 'bg-[#7fba6a] text-[#0a0f0a] hover:bg-[#a3d98f]'
              }`}
          >
            {saving ? 'Saving...' : saved ? '✓ Snapshot saved' : '📸 Save snapshot'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 border border-[#2a3d2a] rounded-xl text-[#7fba6a] hover:bg-[#1a2a1a] transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <button
        onClick={() => onViewDashboard(data.url)}
        className="text-[#5a9ed9] text-sm hover:underline cursor-pointer mb-6 block"
      >
        📊 View historical dashboard for this site →
      </button>

      <div className="flex items-center gap-3 mb-8 text-[#5a6e5a] text-sm animate-fade-up stagger-1">
        <span>{data.pagesScanned} page{data.pagesScanned > 1 ? 's' : ''} scanned</span>
        <span>·</span>
        <span>{data.totalRequests} requests</span>        
        <span>·</span>
        <span>{allFixes.length} issues found</span>
      </div>

      <div className="animate-fade-up stagger-1"><SummaryCard data={data} /></div>
      <div className="animate-fade-up stagger-2"><BeforeAfterBar data={data} /></div>
      <div className="animate-fade-up stagger-3"><WasteBreakdown data={data} /></div>
      <div className="animate-fade-up stagger-4"><FixList fixes={allFixes} /></div>
      <div className="animate-fade-up stagger-5"><Co2Section data={data} /></div>

      <div className="text-center text-[#3a4e3a] text-sm mt-16 mb-8 pt-8 border-t border-[#1a2a1a]">
        <p>Less code. Faster pages. Greener web. 🌱</p>
      </div>
    </div>
  )
}