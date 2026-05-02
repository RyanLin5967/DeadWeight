import { useState, useEffect } from 'react'

const messages = [
  'Loading page...',
  'Capturing network requests...',
  'Analyzing CSS coverage...',
  'Analyzing JavaScript coverage...',
  'Checking image sizes...',
  'Detecting unused fonts...',
  'Categorizing third-party scripts...',
  'Calculating CO₂ emissions...',
  'Building report...',
]

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
      <p className="text-zinc-400 text-lg">{messages[messageIndex]}</p>
    </div>
  )
}