'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface LeaderboardProps {
  myNickname: string
}

interface Entry {
  nickname: string
  total: number
}

type Period = 'today' | 'week' | 'month' | 'year' | 'all'

const medals = ['🥇', '🥈', '🥉']

function getDateRange(period: Period): string | null {
  const now = new Date()
  if (period === 'today') return now.toISOString().split('T')[0]
  if (period === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return d.toISOString().split('T')[0]
  }
  if (period === 'month') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  }
  if (period === 'year') {
    return `${now.getFullYear()}-01-01`
  }
  return null // all time
}

const LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
}

export default function Leaderboard({ myNickname }: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>('today')
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    async function fetch() {
      const from = getDateRange(period)
      let query = supabase.from('focus_sessions').select('nickname, minutes')
      if (from) query = query.gte('date', from)
      const { data } = await query
      if (!data) return

      // Aggregate by nickname
      const map: Record<string, number> = {}
      data.forEach(({ nickname, minutes }) => {
        map[nickname] = (map[nickname] ?? 0) + minutes
      })
      const sorted = Object.entries(map)
        .map(([nickname, total]) => ({ nickname, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
      setEntries(sorted)
    }
    fetch()
  }, [period])

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <h3 className="font-display font-bold text-navy text-base mb-3">🏆 Leaderboard</h3>

      {/* Period tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {(Object.keys(LABELS) as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs font-display font-semibold px-2 py-1 rounded-lg transition-colors ${
              period === p
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">
          No focus sessions yet!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((s, i) => (
            <div
              key={s.nickname}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                s.nickname === myNickname ? 'bg-mint border border-teal/20' : 'bg-gray-50'
              }`}
            >
              <span className="text-base w-6 text-center">
                {medals[i] ?? <span className="text-xs text-gray-400 font-bold">#{i + 1}</span>}
              </span>
              <span className={`font-display font-bold text-sm flex-1 truncate ${
                s.nickname === myNickname ? 'text-teal' : 'text-navy'
              }`}>
                {s.nickname}
                {s.nickname === myNickname && <span className="text-xs font-normal text-gray-400 ml-1">(you)</span>}
              </span>
              <span className="text-sm font-bold text-navy shrink-0">
                {s.total}m
              </span>
            </div>
          ))}
        </div>
      )}

      {period === 'today' && (
        <p className="text-xs text-gray-400 mt-3 text-center">Resets daily at midnight</p>
      )}
    </div>
  )
}
