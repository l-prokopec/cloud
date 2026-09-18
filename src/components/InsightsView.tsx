import { Award, BarChart3, CheckCircle2, Flame } from 'lucide-react'
import { addDays, datesBetween, formatDateKey, startOfWeek } from '../lib/date'
import { calculateHabitStats, getLastDays, isCompletedOn, isScheduledOn } from '../lib/habits'
import type { AppData } from '../types'

export function InsightsView({ data }: { data: AppData }) {
  const today = new Date()
  const active = data.habits.filter((habit) => !habit.archivedAt)
  const stats = active.map((habit) => calculateHabitStats(habit, data.completions[habit.id] ?? [], today))
  const totalCompleted = stats.reduce((sum, item) => sum + item.completed, 0)
  const totalExpected = stats.reduce((sum, item) => sum + item.expected, 0)
  const successRate = totalExpected ? Math.min(100, Math.round(totalCompleted / totalExpected * 100)) : 0
  const bestStreak = Math.max(0, ...stats.map((item) => item.streak.best))
  const weekDays = getLastDays(7, today)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = addDays(gridStart, 41)
  const monthDays = datesBetween(gridStart, gridEnd)
  const monthName = new Intl.DateTimeFormat('cs-CZ', { month: 'long', year: 'numeric' }).format(today)

  const dayMetrics = (date: Date) => {
    const scheduled = active.filter((habit) => isScheduledOn(habit, date))
    const completed = scheduled.filter((habit) => isCompletedOn(data.completions[habit.id] ?? [], date)).length
    return { scheduled: scheduled.length, completed, ratio: scheduled.length ? completed / scheduled.length : 0 }
  }

  return (
    <main className="page-content">
      <section className="page-header"><div><span className="eyebrow">Tvoje výsledky</span><h1>Přehledy</h1><p>Pokrok není o dokonalosti. Důležitý je směr a pravidelnost.</p></div></section>
      <section className="stat-grid">
        <div className="stat-card"><span className="stat-icon green"><CheckCircle2 /></span><div><small>Celkem splněno</small><strong>{totalCompleted}</strong><p>zaznamenaných questů</p></div></div>
        <div className="stat-card"><span className="stat-icon blue"><BarChart3 /></span><div><small>Úspěšnost</small><strong>{successRate}%</strong><p>všech naplánovaných</p></div></div>
        <div className="stat-card"><span className="stat-icon orange"><Flame /></span><div><small>Nejdelší streak</small><strong>{bestStreak}</strong><p>naplánovaných období</p></div></div>
        <div className="stat-card"><span className="stat-icon purple"><Award /></span><div><small>Aktivní habity</small><strong>{active.length}</strong><p>na cestě k cíli</p></div></div>
      </section>

      <div className="insights-grid">
        <section className="panel weekly-panel">
          <div className="panel-heading"><div><span className="eyebrow">Posledních 7 dní</span><h2>Týdenní přehled</h2></div></div>
          <div className="week-chart">
            {weekDays.map((date) => {
              const metric = dayMetrics(date)
              const height = metric.scheduled ? Math.max(8, metric.ratio * 100) : 4
              return <div className="bar-column" key={formatDateKey(date)} title={`${metric.completed} z ${metric.scheduled}`}><div className="bar-track"><span style={{ height: `${height}%` }} /></div><strong>{new Intl.DateTimeFormat('cs-CZ', { weekday: 'short' }).format(date).replace('.', '')}</strong><small>{metric.completed}/{metric.scheduled}</small></div>
            })}
          </div>
        </section>

        <section className="panel month-panel">
          <div className="panel-heading"><div><span className="eyebrow">Kalendář</span><h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2></div><div className="calendar-legend"><span className="legend-done" />Hotovo<span className="legend-partial" />Částečně</div></div>
          <div className="calendar-grid calendar-labels">{['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {monthDays.map((date) => {
              const metric = dayMetrics(date)
              const outside = date.getMonth() !== today.getMonth()
              const future = date > today
              const className = ['calendar-day', outside ? 'outside' : '', future ? 'future' : '', metric.ratio === 1 && metric.scheduled ? 'done' : '', metric.ratio > 0 && metric.ratio < 1 ? 'partial' : '', formatDateKey(date) === formatDateKey(today) ? 'today' : ''].filter(Boolean).join(' ')
              return <div className={className} key={formatDateKey(date)} title={`${metric.completed} z ${metric.scheduled}`}><span>{date.getDate()}</span>{!future && metric.scheduled > 0 && <i>{metric.completed}/{metric.scheduled}</i>}</div>
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
