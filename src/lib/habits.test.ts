import { describe, expect, it } from 'vitest'
import type { Habit } from '../types'
import { calculateHabitStats, calculateStreak } from './habits'

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    title: 'Test habit',
    description: '',
    category: 'Test',
    color: '#000000',
    goalType: 'daily',
    createdAt: new Date(2026, 8, 1, 12).toISOString(),
    ...overrides,
  }
}

describe('calculateStreak', () => {
  it('počítá aktuální a nejlepší denní streak', () => {
    const result = calculateStreak(
      habit(),
      ['2026-09-01', '2026-09-02', '2026-09-04', '2026-09-05', '2026-09-06'],
      new Date(2026, 8, 6, 12),
    )
    expect(result).toEqual({ current: 3, best: 3, unit: 'day' })
  })

  it('nepřeruší aktuální streak, pokud dnešní plánovaný habit ještě není hotový', () => {
    const result = calculateStreak(
      habit(),
      ['2026-09-01', '2026-09-02', '2026-09-03'],
      new Date(2026, 8, 4, 10),
    )
    expect(result.current).toBe(3)
  })

  it('u konkrétních dnů ignoruje dny mimo plán', () => {
    const result = calculateStreak(
      habit({ goalType: 'specific', daysOfWeek: [1, 3, 5] }),
      ['2026-09-02', '2026-09-04', '2026-09-07'],
      new Date(2026, 8, 7, 12),
    )
    expect(result.current).toBe(3)
    expect(result.best).toBe(3)
  })

  it('počítá týdenní streak podle dosažení týdenního cíle', () => {
    const result = calculateStreak(
      habit({ goalType: 'weekly', weeklyTarget: 2 }),
      ['2026-09-01', '2026-09-03', '2026-09-08', '2026-09-10'],
      new Date(2026, 8, 13, 12),
    )
    expect(result).toEqual({ current: 2, best: 2, unit: 'week' })
  })
})

describe('calculateHabitStats', () => {
  it('vrací počet splnění a úspěšnost vůči naplánovaným dnům', () => {
    const result = calculateHabitStats(
      habit(),
      ['2026-09-01', '2026-09-02', '2026-09-04'],
      new Date(2026, 8, 5, 12),
    )
    expect(result.completed).toBe(3)
    expect(result.expected).toBe(5)
    expect(result.successRate).toBe(60)
  })

  it('nezapočítá splnění po archivaci', () => {
    const result = calculateHabitStats(
      habit({ archivedAt: '2026-09-04' }),
      ['2026-09-01', '2026-09-02', '2026-09-05'],
      new Date(2026, 8, 8, 12),
    )
    expect(result.completed).toBe(2)
    expect(result.expected).toBe(3)
  })
})
