import { useState, useEffect } from 'react'

const messages = [
  { text: 'Opening page in headless browser...', icon: '🌐' },
  { text: 'Capturing network requests...', icon: '📡' },
  { text: 'Analyzing CSS coverage...', icon: '🎨' },
  { text: 'Analyzing JavaScript coverage...', icon: '⚙️' },
  { text: 'Measuring image dimensions...', icon: '🖼️' },
  { text: 'Detecting unused fonts...', icon: '🔤' },
  { text: 'Categorizing third-party scripts...', icon: '🌐' },
  { text: 'Calculating CO₂ emissions...', icon: '🌱' },
  { text: 'Scanning linked pages for shared code...', icon: '🔗' },
  { text: 'Building your report...', icon: '📊' },
]

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#143014] rounded-full blur-[200px] opacity-20 animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated ring */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[#1a3a1a] rounded-full" />
          <div className="absolute inset-0 border-4 border-[#7fba6a] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-3 border-4 border-[#4a8a3a] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        <div className="text-center">
          <p className="text-[#e8f0e8] text-lg">
            {messages[messageIndex].icon} {messages[messageIndex].text}{dots}
          </p>
          <p className="text-[#4a5e4a] text-sm mt-3">This usually takes 10–20 seconds</p>
        </div>
      </div>
    </div>
  )
}