import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { MealPlanEntryDto } from '@/types/meals'

interface MealPlanFormProps {
  initial?: MealPlanEntryDto
  // Dates already planned (excluding this entry itself, if editing) — the backend
  // enforces one meal per day for real; this is just a friendlier inline hint so the
  // user doesn't have to submit to find out.
  takenDates: string[]
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { date: string; name: string; description: string | null }) => void
}

export function MealPlanForm({ initial, takenDates, submitLabel, isPending, onSubmit }: MealPlanFormProps) {
  const [date, setDate] = useState(initial?.date ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const isDateTaken = date !== '' && takenDates.includes(date)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !date || isDateTaken) return
    onSubmit({ date, name: name.trim(), description: description.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="meal-date">Date</Label>
        <Input id="meal-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} autoFocus />
        {isDateTaken && <p className="text-destructive text-sm">A meal is already planned for this date.</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meal-name">Meal</Label>
        <Input id="meal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tacos" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meal-description">Notes (optional)</Label>
        <Textarea id="meal-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Use the leftover chicken" />
      </div>

      <Button type="submit" disabled={!name.trim() || !date || isDateTaken || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
