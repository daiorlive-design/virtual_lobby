import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Room = 'silent' | 'brainstorm'

export interface Presence {
  nickname: string
  room: Room
  status: string
  online_at: string
}

export interface StudyPlan {
  id: string
  nickname: string
  content: string
  created_at: string
}

export interface FocusSession {
  id: string
  nickname: string
  minutes: number
  date: string
}
