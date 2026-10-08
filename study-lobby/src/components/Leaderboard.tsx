'use client'
import { type FocusSession } from '@/lib/supabase'

interface LeaderboardProps {
  sessions: FocusSession[]
  myNickname: string
}

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard({ sessions, myNickname }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <h3 className="font-display font-bold text-navy text-base mb-3">🏆 Today's Leaderboard</h3>

      {sessions.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">
          Complete a Pomodoro to appear here!
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div
              key={s.id}
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
                {s.minutes}m
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 text-center">Resets daily at midnight</p>
    </div>
  )
}
