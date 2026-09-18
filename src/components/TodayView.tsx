import { Check, ChevronRight, Plus, Sparkles } from 'lucide-react'
import { HabitCard } from './HabitCard'
import { isCompletedOn, isScheduledOn } from '../lib/habits'
import type { AppData } from '../types'

interface TodayViewProps {
  data: AppData
  onAdd: () => void
  onToggle: (habitId: string) => void
  onShowHabits: () => void
}

export function TodayView({ data, onAdd, onToggle, onShowHabits }: TodayViewProps) {
  const today = new Date()
  const habits = data.habits.filter((habit) => isScheduledOn(habit, today))
  const completed = habits.filter((habit) => isCompletedOn(data.completions[habit.id] ?? [], today)).length
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0
  const dateLabel = new Intl.DateTimeFormat('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)

  return (
    <main className="page-content">
      <section className="today-hero">
        <div>
          <span className="eyebrow">{dateLabel}</span>
          <h1>{completed === habits.length && habits.length ? 'Dnešní quest splněn.' : 'Co dnes posuneš?'}</h1>
          <p>{habits.length ? `${completed} z ${habits.length} dnešních habitů máš hotovo.` : 'Dnes nemáš naplánované žádné habity.'}</p>
        </div>
        <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}>
          <div><strong>{progress}%</strong><span>dnes</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">Denní plán</span><h2>Dnešní habity</h2></div>
          <button className="button secondary compact" type="button" onClick={onAdd}><Plus size={17} />Přidat</button>
        </div>
        <div className="habit-list">
          {habits.map((habit) => <HabitCard key={habit.id} habit={habit} completions={data.completions[habit.id] ?? []} onToggle={() => onToggle(habit.id)} />)}
          {!habits.length && (
            <div className="empty-state"><span><Sparkles /></span><h3>Volný den</h3><p>Přidej nový habit nebo si užij den bez povinností.</p><button className="button primary" onClick={onAdd}><Plus size={17} />Nový habit</button></div>
          )}
        </div>
      </section>

      <button className="all-habits-link" type="button" onClick={onShowHabits}>
        <span className="mini-icon"><Check size={17} /></span><span><strong>Spravovat všechny habity</strong><small>Úpravy, archivace a cíle</small></span><ChevronRight />
      </button>
    </main>
  )
}
