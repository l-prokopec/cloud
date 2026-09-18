export const WEEKDAYS = [
  { value: 1, short: 'Po', label: 'Pondělí' },
  { value: 2, short: 'Út', label: 'Úterý' },
  { value: 3, short: 'St', label: 'Středa' },
  { value: 4, short: 'Čt', label: 'Čtvrtek' },
  { value: 5, short: 'Pá', label: 'Pátek' },
  { value: 6, short: 'So', label: 'Sobota' },
  { value: 0, short: 'Ne', label: 'Neděle' },
] as const

export type GoalType = 'daily' | 'weekly' | 'specific'
export type Theme = 'light' | 'dark'
export type View = 'today' | 'habits' | 'insights'

export interface Habit {
  id: string
  title: string
  description: string
  category: string
  color: string
  goalType: GoalType
  weeklyTarget?: number
  daysOfWeek?: number[]
  createdAt: string
  archivedAt?: string
}

export interface AppData {
  version: 1
  habits: Habit[]
  completions: Record<string, string[]>
}

export interface HabitDraft {
  title: string
  description: string
  category: string
  color: string
  goalType: GoalType
  weeklyTarget: number
  daysOfWeek: number[]
}

export interface StreakResult {
  current: number
  best: number
  unit: 'day' | 'week'
}

export interface HabitStats {
  completed: number
  expected: number
  successRate: number
  streak: StreakResult
}
