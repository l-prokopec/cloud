import { Archive, ArchiveRestore, Edit3, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { calculateHabitStats, getGoalLabel } from '../lib/habits'
import type { AppData, Habit } from '../types'

interface HabitsViewProps {
  data: AppData
  onAdd: () => void
  onEdit: (habit: Habit) => void
  onArchive: (habit: Habit) => void
  onDelete: (habit: Habit) => void
}

export function HabitsView({ data, onAdd, onEdit, onArchive, onDelete }: HabitsViewProps) {
  const [showArchived, setShowArchived] = useState(false)
  const habits = data.habits.filter((habit) => showArchived ? !!habit.archivedAt : !habit.archivedAt)

  return (
    <main className="page-content">
      <section className="page-header">
        <div><span className="eyebrow">Tvoje rutina</span><h1>Všechny habity</h1><p>Nastav si cíle, které jsou realistické a dlouhodobě udržitelné.</p></div>
        <button className="button primary" type="button" onClick={onAdd}><Plus size={18} />Nový habit</button>
      </section>
      <div className="segmented-control" role="tablist">
        <button className={!showArchived ? 'selected' : ''} onClick={() => setShowArchived(false)}>Aktivní <span>{data.habits.filter((habit) => !habit.archivedAt).length}</span></button>
        <button className={showArchived ? 'selected' : ''} onClick={() => setShowArchived(true)}>Archivované <span>{data.habits.filter((habit) => habit.archivedAt).length}</span></button>
      </div>
      <div className="manage-grid">
        {habits.map((habit) => {
          const stats = calculateHabitStats(habit, data.completions[habit.id] ?? [])
          return (
            <article className="manage-card" key={habit.id} style={{ '--habit-color': habit.color } as React.CSSProperties}>
              <div className="manage-card-accent" />
              <div className="manage-card-header"><span className="category-pill"><span className="category-dot" />{habit.category}</span><span className="goal-label">{getGoalLabel(habit)}</span></div>
              <h3>{habit.title}</h3><p>{habit.description || 'Bez popisu'}</p>
              <div className="manage-stats"><span><strong>{stats.completed}</strong>splnění</span><span><strong>{stats.successRate}%</strong>úspěšnost</span><span><strong>{stats.streak.best}</strong>nejlepší streak</span></div>
              <div className="manage-actions">
                <button onClick={() => onEdit(habit)}><Edit3 size={16} />Upravit</button>
                <button onClick={() => onArchive(habit)}>{habit.archivedAt ? <ArchiveRestore size={16} /> : <Archive size={16} />}{habit.archivedAt ? 'Obnovit' : 'Archivovat'}</button>
                <button className="danger" onClick={() => onDelete(habit)} aria-label={`Smazat ${habit.title}`}><Trash2 size={16} /></button>
              </div>
            </article>
          )
        })}
      </div>
      {!habits.length && <div className="empty-state"><span><Archive /></span><h3>{showArchived ? 'Archiv je prázdný' : 'Začni prvním habitem'}</h3><p>{showArchived ? 'Archivované habity se objeví tady.' : 'Malé kroky vytvářejí velkou změnu.'}</p>{!showArchived && <button className="button primary" onClick={onAdd}><Plus size={17} />Nový habit</button>}</div>}
    </main>
  )
}
