import { formatBytes } from '../utils/formatBytes'

export default function Comparison({ data }) {
  // Median webpage stats (from HTTP Archive 2024/2025 data)
  const MEDIAN_PAGE_WEIGHT = 2500000 // 2.5 MB
  const MEDIAN_CO2 = 0.89 // grams per visit

  const weightRatio = data.totalLoaded / MEDIAN_PAGE_WEIGHT
  const co2Ratio = data.co2.co2PerVisit / MEDIAN_CO2

  const wasteRatio = data.totalWaste / MEDIAN_PAGE_WEIGHT

  let verdict, verdictColor
  if (co2Ratio <= 0.5) { verdict = 'Cleaner than most of the web'; verdictColor = '#4ade80' }
  else if (co2Ratio <= 1) { verdict = 'Below average emissions'; verdictColor = '#7fba6a' }
  else if (co2Ratio <= 2) { verdict = 'Above average emissions'; verdictColor = '#d4a843' }
  else if (co2Ratio <= 5) { verdict = 'Significantly above average'; verdictColor = '#d98a5a' }
  else { verdict = 'Far above average emissions'; verdictColor = '#d9735a' }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[#c8e0c8]">📊 How this site compares</h2>
      <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6">
        <p className="text-lg font-semibold mb-4" style={{ color: verdictColor }}>{verdict}</p>

        <div className="space-y-4">
          {/* Page weight comparison */}
          <div>
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">Page weight vs. median website</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#6a8a6a] mb-1">
                  <span>This site</span>
                  <span>{formatBytes(data.totalLoaded)}</span>
                </div>
                <div className="w-full h-3 bg-[#0a120a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#e8f0e8] animate-grow"
                    style={{ width: `${Math.min(weightRatio * 50, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#6a8a6a] mb-1">
                  <span>Median website</span>
                  <span>{formatBytes(MEDIAN_PAGE_WEIGHT)}</span>
                </div>
                <div className="w-full h-3 bg-[#0a120a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5a6e5a] animate-grow"
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CO2 comparison */}
          <div className="pt-4 border-t border-[#1e2e1e]">
            <p className="text-[#6a8a6a] text-xs uppercase tracking-wider mb-2">CO₂ per visit vs. median website</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#6a8a6a] mb-1">
                  <span>This site</span>
                  <span>{data.co2.co2PerVisit}g</span>
                </div>
                <div className="w-full h-3 bg-[#0a120a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-grow"
                    style={{
                      width: `${Math.min(co2Ratio * 50, 100)}%`,
                      backgroundColor: co2Ratio > 2 ? '#d9735a' : co2Ratio > 1 ? '#d4a843' : '#7fba6a'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#6a8a6a] mb-1">
                  <span>Median website</span>
                  <span>{MEDIAN_CO2}g</span>
                </div>
                <div className="w-full h-3 bg-[#0a120a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5a6e5a] animate-grow"
                    style={{ width: '50%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Waste-only stat */}
          {data.totalWaste > 0 && (
            <div className="pt-4 border-t border-[#1e2e1e]">
              <p className="text-[#8a9e8a] text-sm">
                This site's <span className="text-[#d9735a] font-medium">waste alone</span> ({formatBytes(data.totalWaste)}) is{' '}
                {wasteRatio >= 1
                  ? <span className="text-[#d9735a] font-semibold">{Math.round(wasteRatio * 100)}% the size of an entire median webpage</span>
                  : <span className="text-[#d4a843] font-semibold">{Math.round(wasteRatio * 100)}% the size of a median webpage</span>
                }.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}