import type { AppData, Habit } from '../types'
import { addDays, formatDateKey } from './date'

export const STORAGE_KEY = 'daily-quest:data:v1'

function createDemoHabit(
  id: string,
  title: string,
  description: string,
  category: string,
  color: string,
  goalType: Habit['goalType'],
  createdAt: Date,
  options: Pick<Habit, 'weeklyTarget' | 'daysOfWeek'> = {},
): Habit {
  return {
    id,
    title,
    description,
    category,
    color,
    goalType,
    createdAt: createdAt.toISOString(),
    ...options,
  }
}

export function createDemoData(today = new Date()): AppData {
  const createdAt = addDays(today, -20)
  const habits = [
    createDemoHabit('demo-water', 'Ranní hydratace', 'Začni den velkou sklenicí vody.', 'Zdraví', '#5c8dff', 'daily', createdAt),
    createDemoHabit('demo-read', 'Čtení 20 minut', 'Pár stránek bez telefonu a vyrušení.', 'Osobní růst', '#9b7bea', 'daily', createdAt),
    createDemoHabit('demo-move', 'Pohyb', 'Běh, posilování nebo svižná procházka.', 'Fitness', '#ff795f', 'weekly', createdAt, { weeklyTarget: 4 }),
    createDemoHabit('demo-plan', 'Naplánovat zítřek', 'Sepiš tři nejdůležitější úkoly.', 'Produktivita', '#e9ad3d', 'specific', createdAt, { daysOfWeek: [0, 1, 2, 3, 4] }),
  ]

  const completions: Record<string, string[]> = {}
  habits.forEach((habit, habitIndex) => {
    completions[habit.id] = Array.from({ length: 19 }, (_, index) => addDays(today, index - 19))
      .filter((date, dateIndex) => {
        if (habit.goalType === 'specific' && !habit.daysOfWeek?.includes(date.getDay())) return false
        if (habit.goalType === 'weekly') return [1, 3, 5, 6].includes(date.getDay())
        return (dateIndex + habitIndex) % (habitIndex === 1 ? 4 : 6) !== 0
      })
      .map(formatDateKey)
  })
  return { version: 1, habits, completions }
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppData>
  return candidate.version === 1 && Array.isArray(candidate.habits) && !!candidate.completions && typeof candidate.completions === 'object'
}

export function loadData(storage: Pick<Storage, 'getItem'> = localStorage, today = new Date()): AppData {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createDemoData(today)
    const parsed: unknown = JSON.parse(raw)
    return isAppData(parsed) ? parsed : createDemoData(today)
  } catch {
    return createDemoData(today)
  }
}

export function saveData(data: AppData, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}
