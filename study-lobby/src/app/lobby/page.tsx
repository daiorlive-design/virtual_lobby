'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Room, type StudyPlan, type FocusSession } from '@/lib/supabase'
import Pomodoro from '@/components/Pomodoro'
import StudyPlans from '@/components/StudyPlans'
import Leaderboard from '@/components/Leaderboard'
import RoomCard from '@/components/RoomCard'

interface OnlineUser {
  nickname: string
  room: Room
  status: string
}

export default function LobbyPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [myStatus, setMyStatus] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [leaderboard, setLeaderboard] = useState<FocusSession[]>([])
  const [channel, setChannel] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'rooms' | 'plans' | 'board'>('rooms')

  // Load nickname from session
  useEffect(() => {
    const name = sessionStorage.getItem('nickname')
    if (!name) { router.push('/'); return }
    setNickname(name)
  }, [router])

  // Subscribe to presence + study plans + leaderboard
  useEffect(() => {
    if (!nickname) return

    // Presence channel
    const ch = supabase.channel('lobby', {
      config: { presence: { key: nickname } },
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      const users: OnlineUser[] = Object.values(state).flat().map((p: any) => ({
        nickname: p.nickname,
        room: p.room,
        status: p.status,
      }))
      setOnlineUsers(users)
    })

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ nickname, room: null, status: '' })
      }
    })

    setChannel(ch)

    // Study plans
    supabase
      .from('study_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setStudyPlans(data) })

    const plansSubscription = supabase
      .channel('study_plans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_plans' }, () => {
        supabase
          .from('study_plans')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => { if (data) setStudyPlans(data) })
      })
      .subscribe()

    // Leaderboard — today's focus minutes
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('focus_sessions')
      .select('*')
      .eq('date', today)
      .order('minutes', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setLeaderboard(data) })

    const lbSubscription = supabase
      .channel('focus_sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_sessions' }, () => {
        supabase
          .from('focus_sessions')
          .select('*')
          .eq('date', today)
          .order('minutes', { ascending: false })
          .limit(10)
          .then(({ data }) => { if (data) setLeaderboard(data) })
      })
      .subscribe()

    return () => {
      ch.unsubscribe()
      plansSubscription.unsubscribe()
      lbSubscription.unsubscribe()
    }
  }, [nickname])

  const joinRoom = useCallback(async (room: Room) => {
    setCurrentRoom(room)
    if (channel) {
      await channel.track({ nickname, room, status: myStatus })
    }
  }, [channel, nickname, myStatus])

  const leaveRoom = useCallback(async () => {
    setCurrentRoom(null)
    if (channel) {
      await channel.track({ nickname, room: null, status: myStatus })
    }
  }, [channel, nickname, myStatus])

  const updateStatus = useCallback(async (status: string) => {
    setMyStatus(status)
    if (channel) {
      await channel.track({ nickname, room: currentRoom, status })
    }
  }, [channel, nickname, currentRoom])

  const addFocusMinutes = useCallback(async (minutes: number) => {
    if (minutes <= 0) return
    const today = new Date().toISOString().split('T')[0]
    // Upsert: add to existing minutes for today
    const { data: existing } = await supabase
      .from('focus_sessions')
      .select('id, minutes')
      .eq('nickname', nickname)
      .eq('date', today)
      .single()

    if (existing) {
      await supabase
        .from('focus_sessions')
        .update({ minutes: existing.minutes + minutes })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('focus_sessions')
        .insert({ nickname, minutes, date: today })
    }
  }, [nickname])

  const silentUsers = onlineUsers.filter(u => u.room === 'silent')
  const brainstormUsers = onlineUsers.filter(u => u.room === 'brainstorm')

  if (!nickname) return null

  return (
    <main className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-navy text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📚</span>
          <span className="font-display font-bold text-base">Virtual Study Lobby</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-sm text-white/80">{nickname}</span>
          </div>
          {currentRoom && (
            <span className="text-xs bg-teal px-2 py-1 rounded-full">
              {currentRoom === 'silent' ? '🔇 Silent Zone' : '💡 Brainstorm'}
            </span>
          )}
          <button
            onClick={() => { sessionStorage.removeItem('nickname'); router.push('/') }}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Status bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3">
        <span className="text-sm text-gray-500 shrink-0">What are you studying?</span>
        <input
          type="text"
          value={myStatus}
          onChange={e => updateStatus(e.target.value)}
          placeholder="e.g. Solving calc problems..."
          maxLength={60}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal text-navy"
        />
      </div>

      {/* Mobile tabs */}
      <div className="flex border-b border-gray-200 bg-white md:hidden">
        {(['rooms', 'plans', 'board'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-display font-semibold capitalize transition-colors ${
              activeTab === tab ? 'text-teal border-b-2 border-teal' : 'text-gray-400'
            }`}
          >
            {tab === 'rooms' ? '🏠 Rooms' : tab === 'plans' ? '📋 Plans' : '🏆 Board'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">

        {/* LEFT: Rooms */}
        <div className={`md:col-span-2 space-y-4 ${activeTab !== 'rooms' ? 'hidden md:block' : ''}`}>
          <h2 className="font-display font-bold text-navy text-lg">Study Rooms</h2>

          <RoomCard
            type="silent"
            emoji="🔇"
            title="Silent Study Zone"
            subtitle="Stay muted — pure focus"
            color="bg-mint"
            users={silentUsers}
            isInRoom={currentRoom === 'silent'}
            onJoin={() => joinRoom('silent')}
            onLeave={leaveRoom}
          />

          <RoomCard
            type="brainstorm"
            emoji="💡"
            title="Brainstorm Room"
            subtitle="Talk it out — collaborate"
            color="bg-blue-50"
            users={brainstormUsers}
            isInRoom={currentRoom === 'brainstorm'}
            onJoin={() => joinRoom('brainstorm')}
            onLeave={leaveRoom}
          />

          {/* Pomodoro — shown when in a room */}
          {currentRoom && (
            <div className="mt-2">
              <Pomodoro onComplete={addFocusMinutes} />
            </div>
          )}

          {!currentRoom && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-400 text-sm">
              Join a room to start your Pomodoro timer 🍅
            </div>
          )}
        </div>

        {/* RIGHT: Study Plans + Leaderboard */}
        <div className="space-y-4">
          <div className={activeTab !== 'plans' ? 'hidden md:block' : ''}>
            <StudyPlans
              nickname={nickname}
              plans={studyPlans}
            />
          </div>
          <div className={activeTab !== 'board' ? 'hidden md:block' : ''}>
            <Leaderboard sessions={leaderboard} myNickname={nickname} />
          </div>
        </div>

      </div>
    </main>
  )
}
