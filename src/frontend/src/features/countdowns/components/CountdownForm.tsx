import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CountdownDto } from '@/types/countdowns'

interface CountdownFormProps {
  initial?: CountdownDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { label: string; targetDate: string }) => void
}

export function CountdownForm({ initial, submitLabel, isPending, onSubmit }: CountdownFormProps) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!label.trim() || !targetDate) return
    onSubmit({ label: label.trim(), targetDate })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="countdown-label">Label</Label>
        <Input id="countdown-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Disney trip" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="countdown-date">Target date</Label>
        <Input id="countdown-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>

      <Button type="submit" disabled={!label.trim() || !targetDate || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
