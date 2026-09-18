import { useEffect, useState } from 'react'
import type { AppData, Habit, HabitDraft } from '../types'
import { formatDateKey } from '../lib/date'
import { loadData, saveData } from '../lib/storage'

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function draftToHabit(draft: HabitDraft, previous?: Habit): Habit {
  const base: Habit = {
    id: previous?.id ?? createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category.trim() || 'Ostatní',
    color: draft.color,
    goalType: draft.goalType,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    archivedAt: previous?.archivedAt,
  }
  if (draft.goalType === 'weekly') base.weeklyTarget = draft.weeklyTarget
  if (draft.goalType === 'specific') base.daysOfWeek = [...draft.daysOfWeek]
  return base
}

export function useHabitStore() {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => saveData(data), [data])

  const saveHabit = (draft: HabitDraft, existing?: Habit) => {
    const habit = draftToHabit(draft, existing)
    setData((current) => ({
      ...current,
      habits: existing
        ? current.habits.map((item) => (item.id === existing.id ? habit : item))
        : [...current.habits, habit],
      completions: existing ? current.completions : { ...current.completions, [habit.id]: [] },
    }))
  }

  const toggleCompletion = (habitId: string, date = new Date()) => {
    const key = formatDateKey(date)
    setData((current) => {
      const existing = current.completions[habitId] ?? []
      const completions = existing.includes(key)
        ? existing.filter((item) => item !== key)
        : [...existing, key].sort()
      return { ...current, completions: { ...current.completions, [habitId]: completions } }
    })
  }

  const toggleArchive = (habit: Habit) => {
    setData((current) => ({
      ...current,
      habits: current.habits.map((item) =>
        item.id === habit.id
          ? { ...item, archivedAt: item.archivedAt ? undefined : formatDateKey(new Date()) }
          : item,
      ),
    }))
  }

  const deleteHabit = (habitId: string) => {
    setData((current) => {
      const completions = { ...current.completions }
      delete completions[habitId]
      return {
        ...current,
        habits: current.habits.filter((habit) => habit.id !== habitId),
        completions,
      }
    })
  }

  return { data, saveHabit, toggleCompletion, toggleArchive, deleteHabit }
}
