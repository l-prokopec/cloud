import type { Habit, HabitStats, StreakResult } from '../types'
import {
  addDays,
  datesBetween,
  differenceInDays,
  endOfWeek,
  formatDateKey,
  minDate,
  parseDateKey,
  startOfDay,
  startOfWeek,
  weeksBetween,
} from './date'

function createdDate(habit: Habit): Date {
  return startOfDay(new Date(habit.createdAt))
}

function activeEndDate(habit: Habit, today: Date): Date {
  return habit.archivedAt ? minDate(parseDateKey(habit.archivedAt), today) : today
}

export function isHabitActiveOn(habit: Habit, date: Date): boolean {
  const day = startOfDay(date)
  return day >= createdDate(habit) && (!habit.archivedAt || day < parseDateKey(habit.archivedAt))
}

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (!isHabitActiveOn(habit, date)) return false
  if (habit.goalType === 'daily' || habit.goalType === 'weekly') return true
  return habit.daysOfWeek?.includes(date.getDay()) ?? false
}

export function isCompletedOn(completionKeys: string[], date: Date): boolean {
  return completionKeys.includes(formatDateKey(date))
}

export function getWeekCompletionCount(completionKeys: string[], date: Date): number {
  const startKey = formatDateKey(startOfWeek(date))
  const endKey = formatDateKey(endOfWeek(date))
  return completionKeys.filter((key) => key >= startKey && key <= endKey).length
}

export function getGoalLabel(habit: Habit): string {
  if (habit.goalType === 'daily') return 'Každý den'
  if (habit.goalType === 'weekly') return `${habit.weeklyTarget ?? 1}× týdně`
  const labels = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
  return (habit.daysOfWeek ?? []).map((day) => labels[day]).join(', ')
}

function getScheduledDates(habit: Habit, through: Date): Date[] {
  const start = createdDate(habit)
  const end = activeEndDate(habit, through)
  if (end < start) return []
  return datesBetween(start, end).filter((date) => isScheduledOn(habit, date))
}

function calculateDailyStreak(habit: Habit, completionKeys: string[], today: Date): StreakResult {
  const scheduled = getScheduledDates(habit, today)
  if (scheduled.length === 0) return { current: 0, best: 0, unit: 'day' }

  let best = 0
  let run = 0
  for (const date of scheduled) {
    if (isCompletedOn(completionKeys, date)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  let current = 0
  let cursor = scheduled.length - 1
  const last = scheduled[cursor]
  if (last && formatDateKey(last) === formatDateKey(today) && !isCompletedOn(completionKeys, last)) {
    cursor -= 1
  }
  for (; cursor >= 0; cursor -= 1) {
    const date = scheduled[cursor]
    if (!date || !isCompletedOn(completionKeys, date)) break
    current += 1
  }

  return { current, best, unit: 'day' }
}

function weekSucceeded(habit: Habit, completionKeys: string[], week: Date): boolean {
  return getWeekCompletionCount(completionKeys, week) >= (habit.weeklyTarget ?? 1)
}

function calculateWeeklyStreak(habit: Habit, completionKeys: string[], today: Date): StreakResult {
  const weeks = weeksBetween(createdDate(habit), activeEndDate(habit, today))
  let best = 0
  let run = 0
  for (const week of weeks) {
    if (weekSucceeded(habit, completionKeys, week)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  let cursor = weeks.length - 1
  const currentWeek = weeks[cursor]
  const isOpenCurrentWeek = !habit.archivedAt && currentWeek && endOfWeek(currentWeek) >= startOfDay(today)
  if (isOpenCurrentWeek && !weekSucceeded(habit, completionKeys, currentWeek)) cursor -= 1

  let current = 0
  for (; cursor >= 0; cursor -= 1) {
    const week = weeks[cursor]
    if (!week || !weekSucceeded(habit, completionKeys, week)) break
    current += 1
  }
  return { current, best, unit: 'week' }
}

export function calculateStreak(habit: Habit, completionKeys: string[], today = new Date()): StreakResult {
  return habit.goalType === 'weekly'
    ? calculateWeeklyStreak(habit, completionKeys, today)
    : calculateDailyStreak(habit, completionKeys, today)
}

function weeklyExpected(habit: Habit, today: Date): number {
  const target = habit.weeklyTarget ?? 1
  const end = activeEndDate(habit, today)
  return weeksBetween(createdDate(habit), end).reduce((total, week) => {
    const activeStart = createdDate(habit) > week ? createdDate(habit) : week
    const weekEnd = minDate(endOfWeek(week), end)
    const availableDays = Math.max(0, differenceInDays(weekEnd, activeStart) + 1)
    return total + Math.min(target, availableDays)
  }, 0)
}

export function calculateHabitStats(habit: Habit, completionKeys: string[], today = new Date()): HabitStats {
  const relevantCompletions = completionKeys.filter((key) => {
    const date = parseDateKey(key)
    return date <= startOfDay(today) && date >= createdDate(habit) && (!habit.archivedAt || date < parseDateKey(habit.archivedAt))
  })
  const expected = habit.goalType === 'weekly' ? weeklyExpected(habit, today) : getScheduledDates(habit, today).length
  return {
    completed: relevantCompletions.length,
    expected,
    successRate: expected === 0 ? 0 : Math.min(100, Math.round((relevantCompletions.length / expected) * 100)),
    streak: calculateStreak(habit, relevantCompletions, today),
  }
}

export function getLastDays(amount: number, today = new Date()): Date[] {
  return Array.from({ length: amount }, (_, index) => addDays(today, index - amount + 1))
}
