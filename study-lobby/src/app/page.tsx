'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEnter = () => {
    const clean = nickname.trim()
    if (!clean) { setError('Please type your name first!'); return }
    if (clean.length < 2) { setError('Name must be at least 2 characters.'); return }
    if (clean.length > 30) { setError('Name must be 30 characters or less.'); return }
    sessionStorage.setItem('nickname', clean)
    router.push('/lobby')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="font-display text-4xl font-bold text-navy mb-2">
            Virtual Study Lobby
          </h1>
          <p className="text-gray-500 text-base">
            A focused space to study together — silently or collaboratively.
          </p>
        </div>

        {/* Entry card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <label className="block font-display font-semibold text-navy text-sm uppercase tracking-widest mb-3">
            Your name
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="e.g. Maria, João, Ana..."
            maxLength={30}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-navy text-base focus:outline-none focus:border-teal transition-colors"
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          <button
            onClick={handleEnter}
            className="mt-4 w-full bg-navy text-white font-display font-bold py-3 px-6 rounded-xl hover:bg-teal transition-colors text-base"
          >
            Enter the Lobby →
          </button>
        </div>

        {/* Room preview */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-mint rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🔇</div>
            <div className="font-display font-bold text-navy text-sm">Silent Study Zone</div>
            <div className="text-xs text-gray-500 mt-1">Muted — stay focused</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">💡</div>
            <div className="font-display font-bold text-navy text-sm">Brainstorm Room</div>
            <div className="text-xs text-gray-500 mt-1">Talk it out together</div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          No account needed. Just type your name and start studying.
        </p>
      </div>
    </main>
  )
}
