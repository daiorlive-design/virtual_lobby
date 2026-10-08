'use client'
import { useState } from 'react'
import { supabase, type StudyPlan } from '@/lib/supabase'

interface StudyPlansProps {
  nickname: string
  plans: StudyPlan[]
  onDelete: (id: string) => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function StudyPlans({ nickname, plans, onDelete }: StudyPlansProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const post = async () => {
    const text = content.trim()
    if (!text) return
    setSending(true)
    await supabase.from('study_plans').insert({ nickname, content: text })
    setContent('')
    setSending(false)
  }

  const deletePlan = async (id: string) => {
    setDeleting(id)
    onDelete(id) // remove immediately from UI
    await supabase.from('study_plans').delete().eq('id', id)
    setDeleting(null)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <h3 className="font-display font-bold text-navy text-base mb-3">📋 Study Plans</h3>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }}
          placeholder="What's your plan for this session?"
          maxLength={200}
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal text-navy resize-none"
        />
        <button
          onClick={post}
          disabled={sending || !content.trim()}
          className="mt-2 w-full bg-navy text-white text-sm font-display font-bold py-2 rounded-xl hover:bg-teal transition-colors disabled:opacity-40"
        >
          {sending ? 'Posting...' : 'Post plan'}
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {plans.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">
            No plans yet — share what you're working on!
          </p>
        )}
        {plans.map(plan => (
          <div key={plan.id} className="bg-gray-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-navy text-xs">{plan.nickname}</span>
              <span className="text-xs text-gray-400 flex-1">{timeAgo(plan.created_at)}</span>
              {plan.nickname === nickname && (
                <button
                  onClick={() => deletePlan(plan.id)}
                  disabled={deleting === plan.id}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  {deleting === plan.id ? '...' : '✕'}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700">{plan.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
