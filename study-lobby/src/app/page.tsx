'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
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
  const [activeTab, setActiveTab] = useState<'rooms' | 'plans' | 'board'>('rooms')

  const channelRef = useRef<any>(null)
  const currentRoomRef = useRef<Room | null>(null)
  const myStatusRef = useRef<string>('')
  const nicknameRef = useRef<string>('')

  // Keep refs in sync
  useEffect(() => { currentRoomRef.current = currentRoom }, [currentRoom])
  useEffect(() => { myStatusRef.current = myStatus }, [myStatus])
  useEffect(() => { nicknameRef.current = nickname }, [nickname])

  // Load nickname from session
  useEffect(() => {
    const name = sessionStorage.getItem('nickname')
    if (!name) { router.push('/'); return }
    setNickname(name)
    nicknameRef.current = name
  }, [router])

  // Fetch plans helper
  const fetchPlans = useCallback(() => {
    supabase
      .from('study_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setStudyPlans(data) })
  }, [])

  // Fetch leaderboard helper
  const fetchLeaderboard = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('focus_sessions')
      .select('*')
      .eq('date', today)
      .order('minutes', { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setLeaderboard(data) })
  }, [])

  // Setup presence + subscriptions once nickname is ready
  useEffect(() => {
    if (!nickname) return

    // Initial fetches
    fetchPlans()
    fetchLeaderboard()

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
        await ch.track({
          nickname,
          room: currentRoomRef.current,
          status: myStatusRef.current,
        })
      }
    })

    channelRef.current = ch

    // Study plans realtime
    const plansSubscription = supabase
      .channel('study_plans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_plans' }, fetchPlans)
      .subscribe()

    // Leaderboard realtime
    const lbSubscription = supabase
      .channel('focus_sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_sessions' }, fetchLeaderboard)
      .subscribe()

    // Fallback polling every 5 seconds
    const pollInterval = setInterval(() => {
      fetchPlans()
      fetchLeaderboard()
    }, 5000)

    return () => {
      ch.unsubscribe()
      plansSubscription.unsubscribe()
      lbSubscription.unsubscribe()
      clearInterval(pollInterval)
    }
  }, [nickname, fetchPlans, fetchLeaderboard])

  const trackPresence = useCallback(async (room: Room | null, status: string) => {
    if (channelRef.current) {
      await channelRef.current.track({
        nickname: nicknameRef.current,
        room,
        status,
      })
    }
  }, [])

  const joinRoom = useCallback(async (room: Room) => {
    setCurrentRoom(room)
    currentRoomRef.current = room
    await trackPresence(room, myStatusRef.current)
  }, [trackPresence])

  const leaveRoom = useCallback(async () => {
    setCurrentRoom(null)
    currentRoomRef.current = null
    await trackPresence(null, myStatusRef.current)
  }, [trackPresence])

  const updateStatus = useCallback(async (status: string) => {
    setMyStatus(status)
    myStatusRef.current = status
    await trackPresence(currentRoomRef.current, status)
  }, [trackPresence])

  const deletePlan = useCallback((id: string) => {
    setStudyPlans(prev => prev.filter(p => p.id !== id))
  }, [])

  const addFocusMinutes = useCallback(async (minutes: number) => {
    if (minutes <= 0) return
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('focus_sessions')
      .select('id, minutes')
      .eq('nickname', nicknameRef.current)
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
        .insert({ nickname: nicknameRef.current, minutes, date: today })
    }
    fetchLeaderboard()
  }, [fetchLeaderboard])

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
            <StudyPlans nickname={nickname} plans={studyPlans} onDelete={deletePlan} />
          </div>
          <div className={activeTab !== 'board' ? 'hidden md:block' : ''}>
            <Leaderboard sessions={leaderboard} myNickname={nickname} />
          </div>
        </div>

      </div>
    </main>
  )
}
