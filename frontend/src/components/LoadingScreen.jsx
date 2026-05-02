import { useState, useEffect } from 'react'

const messages = [
  { text: 'Opening page in headless browser...', icon: '🌐' },
  { text: 'Capturing network requests...', icon: '📡' },
  { text: 'Analyzing CSS coverage...', icon: '🎨' },
  { text: 'Analyzing JavaScript coverage...', icon: '⚙️' },
  { text: 'Measuring image dimensions...', icon: '🖼️' },
  { text: 'Detecting unused fonts...', icon: '🔤' },
  { text: 'Scanning linked pages for shared code...', icon: '🔗' },
  { text: 'Categorizing third-party scripts...', icon: '🌐' },
  { text: 'Calculating CO₂ emissions...', icon: '🌱' },
  { text: 'Building report...', icon: '📊' },
]

export default function LoadingScreen({ onSkip }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [skipping, setSkipping] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const handleSkip = async () => {
    setSkipping(true)
    try {
      await fetch('http://localhost:3001/skip', { method: 'POST' })
    } catch {}
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#143014] rounded-full blur-[200px] opacity-20 animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[#1a3a1a] rounded-full" />
          <div className="absolute inset-0 border-4 border-[#7fba6a] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-3 border-4 border-[#4a8a3a] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        <div className="text-center">
          <p className="text-[#e8f0e8] text-lg">
            {skipping
              ? '⏩ Wrapping up with current data...'
              : `${messages[messageIndex].icon} ${messages[messageIndex].text}${dots}`
            }
          </p>
          <p className="text-[#4a5e4a] text-sm mt-3">
            {skipping ? 'Almost done' : 'This usually takes 10-30 seconds'}
          </p>
        </div>

        {!skipping && (
          <button
            onClick={handleSkip}
            className="mt-4 px-5 py-2 border border-[#2a3d2a] rounded-xl text-[#5a6e5a] text-sm hover:text-[#7fba6a] hover:border-[#3a4e3a] transition-colors cursor-pointer"
          >
            Skip remaining pages
          </button>
        )}
      </div>
    </div>
  )
}