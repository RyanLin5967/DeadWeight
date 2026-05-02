import { useState } from 'react'
import UrlInput from './components/UrlInput'
import LoadingScreen from './components/LoadingScreen'
import Report from './components/Report'

function App() {
  const [state, setState] = useState('idle') // idle, loading, report, error
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {state === 'idle' && <UrlInput onSubmit={handleAnalyze} />}
      {state === 'loading' && <LoadingScreen />}
      {state === 'report' && <Report data={report} onReset={handleReset} />}
      {state === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button onClick={handleReset} className="text-zinc-400 underline cursor-pointer">Try again</button>
        </div>
      )}
    </div>
  )
}

export default App