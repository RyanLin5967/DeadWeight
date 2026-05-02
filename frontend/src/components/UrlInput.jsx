import { useState } from 'react'

export default function UrlInput({ onSubmit }) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    onSubmit(finalUrl)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-5xl font-bold tracking-tight mb-3">DeadWeight</h1>
      <p className="text-zinc-400 text-lg mb-10 text-center max-w-md">
        Find out how much of any website is waste — unused code, oversized images, and unnecessary bloat.
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter any website URL..."
          className="flex-1 px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-lg text-lg text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400 transition-colors"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-white text-zinc-950 font-semibold rounded-lg text-lg hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Scan
        </button>
      </form>
    </div>
  )
}