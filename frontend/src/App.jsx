import { useState } from 'react'
import UrlInput from './components/UrlInput'
import LoadingScreen from './components/LoadingScreen'
import Report from './components/Report'

function App() {
  const [state, setState] = useState('idle')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (url) => {
    setState('loading')
    setError('')
    try {
      const res = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analysis failed')
      }
      const data = await res.json()
      setReport(data)
      setState('report')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setReport(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-[#e8f0e8]">
      {state === 'idle' && <UrlInput onSubmit={handleAnalyze} />}
      {state === 'loading' && <LoadingScreen />}
      {state === 'report' && <Report data={report} onReset={handleReset} />}
      {state === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
          <div className="bg-red-950/30 border border-red-900/40 rounded-2xl p-8 max-w-md text-center">
            <p className="text-red-300 text-lg mb-4">{error}</p>
            <button onClick={handleReset} className="text-[#7fba6a] underline cursor-pointer hover:text-[#a3d98f]">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App