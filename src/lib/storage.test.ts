import { describe, expect, it } from 'vitest'
import type { AppData } from '../types'
import { createDemoData, loadData, saveData, STORAGE_KEY } from './storage'

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  }
}

describe('storage', () => {
  it('uloží a znovu načte stejná data', () => {
    const storage = memoryStorage()
    const data: AppData = { version: 1, habits: [], completions: { test: ['2026-09-18'] } }
    saveData(data, storage)
    expect(loadData(storage)).toEqual(data)
  })

  it('při prvním spuštění vytvoří demo habity', () => {
    const data = loadData(memoryStorage(), new Date(2026, 8, 18, 12))
    expect(data.habits.length).toBeGreaterThanOrEqual(3)
    expect(Object.keys(data.completions)).toHaveLength(data.habits.length)
  })

  it('po poškození uložených dat bezpečně obnoví demo stav', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{broken json' })
    const data = loadData(storage, new Date(2026, 8, 18, 12))
    expect(data).toEqual(createDemoData(new Date(2026, 8, 18, 12)))
  })
})
