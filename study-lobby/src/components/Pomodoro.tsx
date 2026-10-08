'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface PomodoroProps {
  onComplete: (minutes: number) => void
}

type Phase = 'focus' | 'break'

const PRESETS = [
  { label: '25 / 5', focus: 25, brk: 5 },
  { label: '50 / 10', focus: 50, brk: 10 },
  { label: '15 / 3', focus: 15, brk: 3 },
]

export default function Pomodoro({ onComplete }: PomodoroProps) {
  const [preset, setPreset] = useState(0)
  const [phase, setPhase] = useState<Phase>('focus')
  const [seconds, setSeconds] = useState(PRESETS[0].focus * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startSecondsRef = useRef(0)

  const focusSecs = PRESETS[preset].focus * 60
  const breakSecs = PRESETS[preset].brk * 60
  const totalSecs = phase === 'focus' ? focusSecs : breakSecs

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setPhase('focus')
    setSeconds(focusSecs)
  }, [stop, focusSecs])

  useEffect(() => {
    reset()
  }, [preset]) // eslint-disable-line

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          // Phase complete
          if (phase === 'focus') {
            const mins = Math.round((startSecondsRef.current) / 60)
            onComplete(mins)
            setSessions(n => n + 1)
            setPhase('break')
            setRunning(false)
            return breakSecs
          } else {
            setPhase('focus')
            setRunning(false)
            return focusSecs
          }
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, focusSecs, breakSecs, onComplete])

  const start = () => {
    startSecondsRef.current = seconds
    setRunning(true)
  }

  const skip = () => {
    stop()
    if (phase === 'focus') {
      const elapsed = totalSecs - seconds
      if (elapsed > 60) onComplete(Math.round(elapsed / 60))
      setSessions(n => n + 1)
      setPhase('break')
      setSeconds(breakSecs)
    } else {
      setPhase('focus')
      setSeconds(focusSecs)
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const progress = 1 - seconds / totalSecs
  const circumference = 2 * Math.PI * 54

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-navy text-base">🍅 Pomodoro Timer</h3>
        <div className="flex gap-1">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { stop(); setPreset(i) }}
              className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                preset === i ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex gap-2 mb-4">
        <span className={`text-xs font-display font-bold px-3 py-1 rounded-full ${
          phase === 'focus' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'
        }`}>Focus</span>
        <span className={`text-xs font-display font-bold px-3 py-1 rounded-full ${
          phase === 'break' ? 'bg-teal text-white' : 'bg-gray-100 text-gray-400'
        }`}>Break</span>
        {sessions > 0 && (
          <span className="text-xs text-gray-400 ml-auto self-center">
            🍅 × {sessions}
          </span>
        )}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center my-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={phase === 'focus' ? '#1e2d40' : '#3a8c8c'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-navy text-2xl">{mm}:{ss}</span>
            <span className="text-xs text-gray-400">{phase === 'focus' ? 'focus' : 'break'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!running ? (
          <button
            onClick={start}
            className="bg-navy text-white font-display font-bold px-6 py-2 rounded-xl hover:bg-teal transition-colors text-sm"
          >
            {seconds === totalSecs ? 'Start' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={stop}
            className="bg-gray-100 text-navy font-display font-bold px-6 py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Pause
          </button>
        )}
        <button
          onClick={skip}
          className="bg-gray-100 text-gray-500 font-display font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Skip →
        </button>
        <button
          onClick={reset}
          className="bg-gray-100 text-gray-500 font-display font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
