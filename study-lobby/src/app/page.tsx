'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')

  const enter = () => {
    const name = nickname.trim()
    if (!name) return
    sessionStorage.setItem('nickname', name)
    router.push('/lobby')
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="font-display font-bold text-3xl text-navy mb-2">Virtual Study Lobby</h1>
          <p className="text-gray-500 text-sm">A focused space to study together</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <label className="block text-sm font-display font-bold text-navy mb-2">
            Your name
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') enter() }}
            placeholder="e.g. Daiana"
            maxLength={30}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy focus:outline-none focus:border-teal text-sm mb-4"
          />
          <button
            onClick={enter}
            disabled={!nickname.trim()}
            className="w-full bg-navy text-white font-display font-bold py-3 rounded-xl hover:bg-teal transition-colors disabled:opacity-40"
          >
            Enter the Lobby →
          </button>
        </div>

        <p className="text-center mt-4 text-xs text-gray-400">
          No account needed.{' '}
          <Link href="/how-to" className="text-teal hover:underline">How does this work?</Link>
        </p>
      </div>
    </main>
  )
}
