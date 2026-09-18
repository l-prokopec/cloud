import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle2, ListChecks, Moon, Plus, Sun } from 'lucide-react'
import { HabitsView } from './components/HabitsView'
import { HabitFormModal } from './components/HabitFormModal'
import { InsightsView } from './components/InsightsView'
import { Logo } from './components/Logo'
import { TodayView } from './components/TodayView'
import { useHabitStore } from './hooks/useHabitStore'
import type { Habit, HabitDraft, Theme, View } from './types'

const NAV_ITEMS = [
  { view: 'today', label: 'Dnes', icon: CheckCircle2 },
  { view: 'habits', label: 'Habity', icon: ListChecks },
  { view: 'insights', label: 'Přehledy', icon: BarChart3 },
] as const

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('daily-quest:theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const { data, saveHabit, toggleCompletion, toggleArchive, deleteHabit } = useHabitStore()
  const [view, setView] = useState<View>('today')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [editingHabit, setEditingHabit] = useState<Habit | null | undefined>(undefined)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('daily-quest:theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151815' : '#f7f8f3')
  }, [theme])

  const closeModal = () => setEditingHabit(undefined)
  const submitHabit = (draft: HabitDraft) => {
    saveHabit(draft, editingHabit ?? undefined)
    closeModal()
  }
  const confirmDelete = (habit: Habit) => {
    if (window.confirm(`Opravdu smazat „${habit.title}“ včetně celé historie?`)) deleteHabit(habit.id)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <nav className="desktop-nav" aria-label="Hlavní navigace">
          {NAV_ITEMS.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} className={view === itemView ? 'active' : ''} onClick={() => setView(itemView)}><Icon size={17} />{label}</button>)}
        </nav>
        <div className="topbar-actions">
          <button className="icon-button" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Zapnout tmavý režim' : 'Zapnout světlý režim'}>{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button>
          <button className="button primary desktop-add" type="button" onClick={() => setEditingHabit(null)}><Plus size={17} />Nový habit</button>
        </div>
      </header>

      {view === 'today' && <TodayView data={data} onAdd={() => setEditingHabit(null)} onToggle={toggleCompletion} onShowHabits={() => setView('habits')} />}
      {view === 'habits' && <HabitsView data={data} onAdd={() => setEditingHabit(null)} onEdit={setEditingHabit} onArchive={toggleArchive} onDelete={confirmDelete} />}
      {view === 'insights' && <InsightsView data={data} />}

      <nav className="mobile-nav" aria-label="Mobilní navigace">
        {NAV_ITEMS.map(({ view: itemView, label, icon: Icon }) => <button key={itemView} className={view === itemView ? 'active' : ''} onClick={() => setView(itemView)}><Icon size={20} /><span>{label}</span></button>)}
        <button className="mobile-add" onClick={() => setEditingHabit(null)}><Plus size={22} /><span>Přidat</span></button>
      </nav>

      {editingHabit !== undefined && <HabitFormModal habit={editingHabit ?? undefined} onClose={closeModal} onSave={submitHabit} />}
    </div>
  )
}

export default App
