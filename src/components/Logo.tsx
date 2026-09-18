import { Check } from 'lucide-react'

export function Logo() {
  return (
    <div className="logo" aria-label="Daily Quest">
      <span className="logo-mark"><Check size={18} strokeWidth={3} /></span>
      <span>Daily Quest</span>
    </div>
  )
}
