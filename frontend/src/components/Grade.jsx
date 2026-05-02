export default function Grade({ wastePercent }) {
  let grade, color, label
  if (wastePercent <= 5) { grade = 'A+'; color = '#4ade80'; label = 'Exceptional' }
  else if (wastePercent <= 10) { grade = 'A'; color = '#7fba6a'; label = 'Excellent' }
  else if (wastePercent <= 20) { grade = 'B'; color = '#a3d98f'; label = 'Good' }
  else if (wastePercent <= 30) { grade = 'C'; color = '#d4a843'; label = 'Needs work' }
  else if (wastePercent <= 50) { grade = 'D'; color = '#d98a5a'; label = 'Poor' }
  else if (wastePercent <= 70) { grade = 'D-'; color = '#d9735a'; label = 'Very poor' }
  else { grade = 'F'; color = '#e05252'; label = 'Critical' }

  return (
    <div className="bg-[#111a11] border border-[#1e2e1e] rounded-2xl p-6 mb-8 flex items-center gap-6">
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center text-[#0a0f0a] font-bold text-4xl shrink-0"
        style={{ backgroundColor: color }}
      >
        {grade}
      </div>
      <div>
        <p className="text-xl font-semibold text-[#e8f0e8]">Sustainability grade: <span style={{ color }}>{label}</span></p>
        <p className="text-[#6a8a6a] text-sm mt-1">
          {wastePercent <= 10
            ? 'This page loads efficiently with minimal waste. Well built.'
            : wastePercent <= 30
            ? 'This page has some unnecessary bloat that could be trimmed for a greener web.'
            : wastePercent <= 50
            ? 'A significant portion of this page is waste — unused code, oversized assets, or unnecessary dependencies.'
            : 'Most of what this page loads is never used. Major cleanup would dramatically reduce its environmental footprint.'
          }
        </p>
      </div>
    </div>
  )
}