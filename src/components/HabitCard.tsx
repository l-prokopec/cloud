import { Check, Flame, RotateCcw } from 'lucide-react'
import { calculateStreak, getGoalLabel, getWeekCompletionCount, isCompletedOn } from '../lib/habits'
import type { Habit } from '../types'

interface HabitCardProps {
  habit: Habit
  completions: string[]
  onToggle: () => void
}

export function HabitCard({ habit, completions, onToggle }: HabitCardProps) {
  const today = new Date()
  const completed = isCompletedOn(completions, today)
  const streak = calculateStreak(habit, completions, today)
  const weekCount = habit.goalType === 'weekly' ? getWeekCompletionCount(completions, today) : null

  return (
    <article className={`habit-card ${completed ? 'is-complete' : ''}`} style={{ '--habit-color': habit.color } as React.CSSProperties}>
      <button
        className="habit-check"
        type="button"
        onClick={onToggle}
        aria-label={completed ? `Vrátit splnění: ${habit.title}` : `Označit jako splněné: ${habit.title}`}
        aria-pressed={completed}
      >
        {completed ? <Check size={22} strokeWidth={3} /> : <span className="check-dot" />}
      </button>
      <div className="habit-card-body">
        <div className="habit-card-topline">
          <span className="category-pill"><span className="category-dot" />{habit.category}</span>
          <span className="goal-label">{getGoalLabel(habit)}</span>
        </div>
        <h3>{habit.title}</h3>
        {habit.description && <p>{habit.description}</p>}
        {weekCount !== null && (
          <div className="weekly-progress" aria-label={`${weekCount} z ${habit.weeklyTarget} splnění tento týden`}>
            <span style={{ width: `${Math.min(100, (weekCount / (habit.weeklyTarget ?? 1)) * 100)}%` }} />
          </div>
        )}
      </div>
      <div className="habit-card-side">
        <span className="streak-badge" title="Aktuální streak"><Flame size={15} />{streak.current}</span>
        {completed && <button className="undo-button" type="button" onClick={onToggle}><RotateCcw size={14} />Vrátit</button>}
      </div>
    </article>
  )
}
