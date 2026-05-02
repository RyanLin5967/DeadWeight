import { useState, useEffect } from 'react'
import { formatBytes } from '../utils/formatBytes'

export default function Dashboard({ url, onReset, onRescan }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3001/snapshots?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false))
  }, [url])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#1a3a1a] border-t-[#7fba6a] rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || data.snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-[#6a8a6a] text-lg">No snapshots saved for this site yet.</p>
        <button onClick={onReset} className="text-[#7fba6a] underline cursor-pointer">← Go back</button>
      </div>
    )
  }

  const snapshots = data.snapshots
  const latest = snapshots[snapshots.length - 1]
  const first = snapshots[0]
  const improved = first.totalWaste - latest.totalWaste
  const co2Improved = first.annualCo2 - latest.annualCo2

  // Find max values for chart scaling
  const maxLoaded = Math.max(...snapshots.map(s => s.totalLoaded))

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
            <h1 className="text-2xl font-bold text-[#e8f0e8]">Dead<span className="text-[#7fba6a]">Weight</span></h1>
            <p className="text-[#5a6e5a] text-sm">Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRescan(url)}
            className="px-4 py-2 bg-[#7fba6a] text-[#0a0f0a] rounded-xl text-sm font-medium hover:bg-[#a3d98f] cursor-pointer"
          >
            🔄 Rescan now
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 border border-[#2a3d2a] rounded-xl text-[#7fba6a] hover:bg-[#1a2a1a] transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Site URL */}
      <p className="text-[#6a8a6a] text-sm mb-8 break-all">{url}</p>

      {/* Progress summary */}
      {snapshots.length > 1 && (
        <div className={`rounded-2xl p-6 mb-8 border animate-fade-up ${improved > 0 ? 'bg-[#122212] border-[#2a4a2a]' : 'bg-[#1a1511] border-[#2a2520]'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{improved > 0 ? '🌿' : '📈'}</span>
            <h2 className="text-xl font-semibold text-[#e8f0e8]">
              {improved > 0 ? 'Progress since first scan' : 'Site has grown since first scan'}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-1">Waste change</p>
              <p className={`text-2xl font-bold ${improved > 0 ? 'text-[#7fba6a]' : 'text-[#d9735a]'}`}>
                {improved > 0 ? '↓' : '↑'} {formatBytes(Math.abs(improved))}
              </p>
            </div>
            <div>
              <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-1">CO₂ change</p>
              <p className={`text-2xl font-bold ${co2Improved > 0 ? 'text-[#7fba6a]' : 'text-[#d9735a]'}`}>
                {co2Improved > 0 ? '↓' : '↑'} {Math.abs(Math.round(co2Improved * 10) / 10)} kg/yr
              </p>
            </div>
            <div>
              <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-1">Waste % change</p>
              <p className={`text-2xl font-bold ${first.wastePercent > latest.wastePercent ? 'text-[#7fba6a]' : 'text-[#d9735a]'}`}>
                {first.wastePercent}% → {latest.wastePercent}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline chart */}
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 mb-8 animate-fade-up stagger-1">
        <h2 className="text-lg font-semibold text-[#c8e0c8] mb-6">Page weight over time</h2>
        <div className="flex items-end gap-2 h-48">
          {snapshots.map((snap, i) => {
            const totalHeight = (snap.totalLoaded / maxLoaded) * 100
            const wasteHeight = (snap.totalWaste / maxLoaded) * 100
            const essentialHeight = totalHeight - wasteHeight

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-40">
                  <div
                    className="w-full bg-[#d9735a] rounded-t-md transition-all duration-500"
                    style={{ height: `${wasteHeight}%` }}
                    title={`Waste: ${formatBytes(snap.totalWaste)}`}
                  />
                  <div
                    className="w-full bg-[#7fba6a] rounded-b-md transition-all duration-500"
                    style={{ height: `${essentialHeight}%` }}
                    title={`Essential: ${formatBytes(snap.totalLoaded - snap.totalWaste)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[#8a9e8a] text-xs">{formatBytes(snap.totalLoaded)}</p>
                  <p className="text-[#4a5e4a] text-[10px]">
                    {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-4 justify-center text-xs text-[#6a8a6a]">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#7fba6a]" /> Essential</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#d9735a]" /> Waste</div>
        </div>
      </div>

      {/* CO2 over time */}
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 mb-8 animate-fade-up stagger-2">
        <h2 className="text-lg font-semibold text-[#c8e0c8] mb-6">🌱 CO₂ per visit over time</h2>
        <div className="flex items-end gap-2 h-32">
          {snapshots.map((snap, i) => {
            const maxCo2 = Math.max(...snapshots.map(s => s.co2PerVisit))
            const height = maxCo2 > 0 ? (snap.co2PerVisit / maxCo2) * 100 : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-24">
                  <div
                    className="w-full rounded-md transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      backgroundColor: snap.co2PerVisit <= snapshots[0].co2PerVisit * 0.7 ? '#7fba6a'
                        : snap.co2PerVisit <= snapshots[0].co2PerVisit ? '#d4a843'
                        : '#d9735a'
                    }}
                  />
                </div>
                <p className="text-[#8a9e8a] text-xs">{snap.co2PerVisit}g</p>
                <p className="text-[#4a5e4a] text-[10px]">
                  {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Waste breakdown over time */}
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 mb-8 animate-fade-up stagger-3">
        <h2 className="text-lg font-semibold text-[#c8e0c8] mb-6">Waste breakdown over time</h2>
        <div className="space-y-4">
          {snapshots.map((snap, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-[#6a8a6a] mb-1">
                <span>Scan {i + 1} — {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span>{snap.wastePercent}% waste · {snap.issueCount} issues</span>
              </div>
              <div className="w-full h-3 bg-[#0a120a] rounded-full overflow-hidden flex">
                {snap.totalWaste > 0 ? (
                  <>
                    <div className="bg-[#7fba6a] h-full" style={{ width: `${((snap.totalLoaded - snap.totalWaste) / snap.totalLoaded) * 100}%` }} />
                    <div className="bg-[#d4a843] h-full" style={{ width: `${(snap.cssWaste / snap.totalLoaded) * 100}%` }} />
                    <div className="bg-[#d98a5a] h-full" style={{ width: `${(snap.jsWaste / snap.totalLoaded) * 100}%` }} />
                    <div className="bg-[#d9735a] h-full" style={{ width: `${(snap.imageWaste / snap.totalLoaded) * 100}%` }} />
                    <div className="bg-[#a87fd9] h-full" style={{ width: `${(snap.fontWaste / snap.totalLoaded) * 100}%` }} />
                  </>
                ) : (
                  <div className="bg-[#7fba6a] h-full w-full" />
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#6a8a6a]">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#7fba6a] mr-1" />Essential</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#d4a843] mr-1" />CSS</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#d98a5a] mr-1" />JS</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#d9735a] mr-1" />Images</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-[#a87fd9] mr-1" />Fonts</span>
          </div>
        </div>
      </div>

      {/* Snapshot table */}
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 mb-8 animate-fade-up stagger-4">
        <h2 className="text-lg font-semibold text-[#c8e0c8] mb-4">All snapshots</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6a8a6a] text-xs uppercase tracking-wider border-b border-[#1e2e1e]">
                <th className="text-left py-3 pr-4">#</th>
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-right py-3 pr-4">Size</th>
                <th className="text-right py-3 pr-4">Waste</th>
                <th className="text-right py-3 pr-4">Waste %</th>
                <th className="text-right py-3 pr-4">CO₂/visit</th>
                <th className="text-right py-3">Issues</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap, i) => (
                <tr key={i} className="border-b border-[#1a2a1a] last:border-0">
                  <td className="py-3 pr-4 text-[#5a6e5a]">{i + 1}</td>
                  <td className="py-3 pr-4 text-[#8a9e8a]">
                    {new Date(snap.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 pr-4 text-right text-[#c8e0c8]">{formatBytes(snap.totalLoaded)}</td>
                  <td className="py-3 pr-4 text-right text-[#d9735a]">{formatBytes(snap.totalWaste)}</td>
                  <td className={`py-3 pr-4 text-right font-medium ${snap.wastePercent > 30 ? 'text-[#d9735a]' : snap.wastePercent > 10 ? 'text-[#d4a843]' : 'text-[#7fba6a]'}`}>
                    {snap.wastePercent}%
                  </td>
                  <td className="py-3 pr-4 text-right text-[#8a9e8a]">{snap.co2PerVisit}g</td>
                  <td className="py-3 text-right text-[#8a9e8a]">{snap.issueCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-[#3a4e3a] text-sm mt-16 mb-8 pt-8 border-t border-[#1a2a1a]">
        <p>Less code. Faster pages. Greener web. 🌱</p>
      </div>
    </div>
  )
}