const DAY_MS = 86_400_000

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, amount: number): Date {
  const result = startOfDay(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function differenceInDays(later: Date, earlier: Date): number {
  const laterUtc = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  const earlierUtc = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  return Math.round((laterUtc - earlierUtc) / DAY_MS)
}

export function startOfWeek(date: Date): Date {
  const result = startOfDay(date)
  const mondayOffset = result.getDay() === 0 ? -6 : 1 - result.getDay()
  return addDays(result, mondayOffset)
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6)
}

export function datesBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  for (let date = startOfDay(start); date <= startOfDay(end); date = addDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

export function weeksBetween(start: Date, end: Date): Date[] {
  const weeks: Date[] = []
  for (let week = startOfWeek(start); week <= startOfWeek(end); week = addDays(week, 7)) {
    weeks.push(week)
  }
  return weeks
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b)
}

export function minDate(a: Date, b: Date): Date {
  return a < b ? a : b
}
