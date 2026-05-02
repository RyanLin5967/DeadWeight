import SummaryCard from './SummaryCard'
import BeforeAfterBar from './BeforeAfterBar'
import WasteBreakdown from './WasteBreakdown'
import FixList from './FixList'
import Co2Section from './Co2Section'

export default function Report({ data, onReset }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">DeadWeight</h1>
          <p className="text-zinc-400 mt-1 text-sm break-all">{data.url}</p>
        </div>
        <button
          onClick={onReset}
          className="px-5 py-2 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
        >
          Scan another
        </button>
      </div>

      <SummaryCard data={data} />
      <BeforeAfterBar data={data} />
      <WasteBreakdown data={data} />
      <FixList data={data} />
      <Co2Section data={data} />
    </div>
  )
}