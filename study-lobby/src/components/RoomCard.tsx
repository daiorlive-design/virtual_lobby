'use client'
import { type Room } from '@/lib/supabase'

interface User {
  nickname: string
  room: Room
  status: string
}

interface RoomCardProps {
  type: Room
  emoji: string
  title: string
  subtitle: string
  color: string
  users: User[]
  isInRoom: boolean
  onJoin: () => void
  onLeave: () => void
  nickname?: string
}

const BRAINSTORM_CALL_URL = 'https://meet.google.com/gev-pfut-ygk'

export default function RoomCard({
  type, emoji, title, subtitle, color, users, isInRoom, onJoin, onLeave, nickname = ''
}: RoomCardProps) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-black/5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <h3 className="font-display font-bold text-navy text-base">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={() => {
            if (isInRoom) {
              onLeave()
            } else {
              onJoin()
              if (type === 'brainstorm') {
                window.open(BRAINSTORM_CALL_URL, '_blank')
              }
            }
          }}
          className={`text-sm font-display font-bold px-4 py-2 rounded-xl transition-colors shrink-0 ${
            isInRoom
              ? 'bg-navy text-white hover:bg-teal'
              : 'bg-white text-navy hover:bg-navy hover:text-white border border-black/10'
          }`}
        >
          {isInRoom ? 'Leave' : 'Join'}
        </button>
      </div>

      {/* Online users */}
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No one here yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.nickname} className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
              <span className="font-semibold text-navy text-sm">{user.nickname}</span>
              {user.status && (
                <span className="text-xs text-gray-500 truncate">— {user.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        {users.length} {users.length === 1 ? 'student' : 'students'} online
      </div>

      {/* Rejoin call link if already in brainstorm */}
      {type === 'brainstorm' && isInRoom && (
        <div className="mt-3">
          <a
            href={BRAINSTORM_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal hover:underline"
          >
            🔗 Rejoin call
          </a>
        </div>
      )}
    </div>
  )
}
