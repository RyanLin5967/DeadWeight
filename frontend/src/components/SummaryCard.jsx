import { formatBytes } from '../utils/formatBytes'

export default function SummaryCard({ data }) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-10">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-500 text-sm mb-1">Total loaded</p>
        <p className="text-3xl font-bold">{formatBytes(data.totalLoaded)}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-500 text-sm mb-1">Actually needed</p>
        <p className="text-3xl font-bold text-emerald-400">{formatBytes(data.essentialBytes)}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-500 text-sm mb-1">Waste</p>
        <p className="text-3xl font-bold text-red-400">{data.wastePercent}%</p>
      </div>
    </div>
  )
}