import { formatBytes } from '../utils/formatBytes'

export default function SummaryCard({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#1a2a1a] rounded-full blur-[40px] opacity-50" />
        <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">Total loaded</p>
        <p className="text-3xl font-bold text-[#e8f0e8] relative z-10">{formatBytes(data.totalLoaded)}</p>
        <p className="text-[#4a5e4a] text-xs mt-1">{data.totalRequests} requests</p>
      </div>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#0d2a0d] rounded-full blur-[40px] opacity-50" />
        <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">Actually needed</p>
        <p className="text-3xl font-bold text-[#7fba6a] relative z-10">{formatBytes(data.essentialBytes)}</p>
        <p className="text-[#4a5e4a] text-xs mt-1">essential content</p>
      </div>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#2a1a1a] rounded-full blur-[40px] opacity-50" />
        <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">Waste</p>
        <p className={`text-3xl font-bold relative z-10 ${data.wastePercent > 30 ? 'text-[#d9735a]' : data.wastePercent > 10 ? 'text-[#d4a843]' : 'text-[#7fba6a]'}`}>
          {data.wastePercent}%
        </p>
        <p className="text-[#4a5e4a] text-xs mt-1">{formatBytes(data.totalWaste)} removable</p>
      </div>
    </div>
  )
}