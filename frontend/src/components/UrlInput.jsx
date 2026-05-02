import { useState, useEffect } from 'react'
import { formatBytes } from '../utils/formatBytes'

export default function UrlInput({ onSubmit, onViewDashboard }) {
  const [url, setUrl] = useState('')
  const [sites, setSites] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/sites')
      .then(res => res.json())
      .then(data => setSites(data))
      .catch(() => {})
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    onSubmit(finalUrl)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#1a3a1a] rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#0d2a0d] rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#143014] rounded-full blur-[200px] opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 animate-fade-up">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7fba6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1.14-2.8a8.35 8.35 0 0 0 3.15.8 9.43 9.43 0 0 0 7-3A9.43 9.43 0 0 0 20 10a18.45 18.45 0 0 0 .5-7.5 18.45 18.45 0 0 0-7.5.5" />
            <path d="M12 12l-5 9.5" />
          </svg>
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-3 animate-fade-up text-[#e8f0e8]">
          Dead<span className="text-[#7fba6a]">Weight</span>
        </h1>

        <p className="text-[#8a9e8a] text-lg mb-4 text-center max-w-lg animate-fade-up stagger-1">
          Discover how much of any website is waste — unused code, oversized images, and unnecessary bloat.
        </p>

        <p className="text-[#5a6e5a] text-sm mb-10 animate-fade-up stagger-2">
          Less code. Faster pages. Greener web.
        </p>

        <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3 animate-fade-up stagger-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter any website URL..."
            className="flex-1 px-5 py-4 bg-[#111a11] border border-[#2a3d2a] rounded-xl text-lg text-[#e8f0e8] placeholder-[#4a5e4a] outline-none focus:border-[#7fba6a] focus:shadow-[0_0_20px_rgba(127,186,106,0.1)] transition-all"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-[#7fba6a] text-[#0a0f0a] font-semibold rounded-xl text-lg hover:bg-[#a3d98f] transition-colors cursor-pointer"
          >
            Scan
          </button>
        </form>

        <div className="flex gap-8 mt-12 text-[#4a5e4a] text-sm animate-fade-up stagger-4">
          <span>🔍 CSS & JS coverage</span>
          <span>🖼️ Image analysis</span>
          <span>🌱 CO₂ impact</span>
        </div>

        {/* Tracked sites */}
        {sites.length > 0 && (
          <div className="mt-16 w-full max-w-xl animate-fade-up stagger-5">
            <h3 className="text-[#5a6e5a] text-xs uppercase tracking-wider mb-3">Tracked sites</h3>
            <div className="space-y-2">
              {sites.map((site) => (
                <button
                  key={site.key}
                  onClick={() => onViewDashboard(site.url)}
                  className="w-full flex items-center justify-between bg-[#111a11] border border-[#1e2e1e] rounded-xl px-4 py-3 hover:border-[#2a3d2a] hover:bg-[#151f15] transition-all cursor-pointer text-left"
                >
                  <div>
                    <p className="text-[#c8e0c8] text-sm">{site.key}</p>
                    <p className="text-[#4a5e4a] text-xs mt-0.5">{site.snapshotCount} snapshot{site.snapshotCount > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${site.latest.wastePercent > 30 ? 'text-[#d9735a]' : site.latest.wastePercent > 10 ? 'text-[#d4a843]' : 'text-[#7fba6a]'}`}>
                      {site.latest.wastePercent}% waste
                    </p>
                    <p className="text-[#4a5e4a] text-xs">{formatBytes(site.latest.totalLoaded)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}