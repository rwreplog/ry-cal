import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BirthdayDto } from '@/types/birthdays'

interface BirthdayFormProps {
  initial?: BirthdayDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { name: string; date: string }) => void
}

export function BirthdayForm({ initial, submitLabel, isPending, onSubmit }: BirthdayFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [date, setDate] = useState(initial?.date ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !date) return
    onSubmit({ name: name.trim(), date })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="birthday-name">Name</Label>
        <Input id="birthday-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grandma" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="birthday-date">Birthday</Label>
        <Input id="birthday-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <Button type="submit" disabled={!name.trim() || !date || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
