import SummaryCard from './SummaryCard'
import BeforeAfterBar from './BeforeAfterBar'
import WasteBreakdown from './WasteBreakdown'
import FixList from './FixList'
import Co2Section from './Co2Section'

export default function Report({ data, onReset }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 animate-fade-up">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7fba6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.14-2.8a8.35 8.35 0 0 0 3.15.8 9.43 9.43 0 0 0 7-3A9.43 9.43 0 0 0 20 10a18.45 18.45 0 0 0 .5-7.5 18.45 18.45 0 0 0-7.5.5" />
            <path d="M12 12l-5 9.5" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-[#e8f0e8]">
              Dead<span className="text-[#7fba6a]">Weight</span>
            </h1>
            <p className="text-[#5a6e5a] text-sm break-all mt-0.5">{data.url}</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="px-5 py-2 border border-[#2a3d2a] rounded-xl text-[#7fba6a] hover:bg-[#1a2a1a] transition-colors cursor-pointer text-sm"
        >
          ← Scan another
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-8 text-[#5a6e5a] text-sm animate-fade-up stagger-1">
        <span>{data.totalRequests} requests</span>
        <span>·</span>
        <span>{data.css.length + data.js.length + data.images.length + data.fonts.length} issues found</span>
      </div>

      <div className="animate-fade-up stagger-1"><SummaryCard data={data} /></div>
      <div className="animate-fade-up stagger-2"><BeforeAfterBar data={data} /></div>
      <div className="animate-fade-up stagger-3"><WasteBreakdown data={data} /></div>
      <div className="animate-fade-up stagger-4"><FixList data={data} /></div>
      <div className="animate-fade-up stagger-5"><Co2Section data={data} /></div>

      {/* Footer */}
      <div className="text-center text-[#3a4e3a] text-sm mt-16 mb-8 pt-8 border-t border-[#1a2a1a]">
        <p>Less code. Faster pages. Greener web. 🌱</p>
      </div>
    </div>
  )
}