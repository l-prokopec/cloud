import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Habit, HabitDraft } from '../types'
import { WEEKDAYS } from '../types'

const COLORS = ['#5c8dff', '#9b7bea', '#ff795f', '#e9ad3d', '#48a985', '#e2649a']
const CATEGORIES = ['Zdraví', 'Fitness', 'Produktivita', 'Osobní růst', 'Mindfulness', 'Ostatní']

function toDraft(habit?: Habit): HabitDraft {
  return {
    title: habit?.title ?? '',
    description: habit?.description ?? '',
    category: habit?.category ?? 'Zdraví',
    color: habit?.color ?? COLORS[0]!,
    goalType: habit?.goalType ?? 'daily',
    weeklyTarget: habit?.weeklyTarget ?? 3,
    daysOfWeek: habit?.daysOfWeek ?? [1, 2, 3, 4, 5],
  }
}

interface HabitFormModalProps {
  habit?: Habit
  onClose: () => void
  onSave: (draft: HabitDraft) => void
}

export function HabitFormModal({ habit, onClose, onSave }: HabitFormModalProps) {
  const [draft, setDraft] = useState(() => toDraft(habit))
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const valid = draft.title.trim().length > 0 && (draft.goalType !== 'specific' || draft.daysOfWeek.length > 0)
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!valid) return
    onSave(draft)
  }

  const toggleDay = (day: number) => {
    setDraft((current) => ({
      ...current,
      daysOfWeek: current.daysOfWeek.includes(day)
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day],
    }))
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="habit-form-title">
        <div className="modal-header">
          <div><span className="eyebrow">{habit ? 'Upravit quest' : 'Nový quest'}</span><h2 id="habit-form-title">{habit ? habit.title : 'Vytvoř nový habit'}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Zavřít"><X size={21} /></button>
        </div>
        <form onSubmit={submit}>
          <label className="field">Název
            <input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Např. Čtení 20 minut" />
            {submitted && !draft.title.trim() && <small className="field-error">Název je povinný.</small>}
          </label>
          <label className="field">Popis <span className="optional">volitelné</span>
            <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Co přesně chceš udělat?" rows={3} />
          </label>
          <div className="form-grid">
            <label className="field">Kategorie
              <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <fieldset className="field color-field"><legend>Barva</legend>
              <div className="color-options">
                {COLORS.map((color) => <button key={color} className={draft.color === color ? 'selected' : ''} style={{ background: color }} type="button" onClick={() => setDraft({ ...draft, color })} aria-label={`Barva ${color}`} />)}
              </div>
            </fieldset>
          </div>
          <fieldset className="field"><legend>Cíl</legend>
            <div className="goal-options">
              {([
                ['daily', 'Každý den', 'Pravidelně každý den'],
                ['weekly', 'Xkrát týdně', 'Kdykoliv během týdne'],
                ['specific', 'Vybrané dny', 'Pevné dny v týdnu'],
              ] as const).map(([value, label, hint]) => (
                <label key={value} className={draft.goalType === value ? 'goal-option selected' : 'goal-option'}>
                  <input type="radio" name="goal" checked={draft.goalType === value} onChange={() => setDraft({ ...draft, goalType: value })} />
                  <span><strong>{label}</strong><small>{hint}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          {draft.goalType === 'weekly' && (
            <label className="field">Kolikrát týdně
              <input type="number" min="1" max="7" value={draft.weeklyTarget} onChange={(event) => setDraft({ ...draft, weeklyTarget: Number(event.target.value) })} />
            </label>
          )}
          {draft.goalType === 'specific' && (
            <fieldset className="field"><legend>Dny v týdnu</legend>
              <div className="weekday-picker">
                {WEEKDAYS.map((day) => <button key={day.value} type="button" className={draft.daysOfWeek.includes(day.value) ? 'selected' : ''} onClick={() => toggleDay(day.value)} title={day.label}>{day.short}</button>)}
              </div>
              {submitted && draft.daysOfWeek.length === 0 && <small className="field-error">Vyber alespoň jeden den.</small>}
            </fieldset>
          )}
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose}>Zrušit</button>
            <button className="button primary" type="submit">{habit ? 'Uložit změny' : 'Vytvořit habit'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
