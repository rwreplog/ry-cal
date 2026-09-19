import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FamilyMemberDto } from '@/types/family'

const SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899']

interface FamilyMemberFormProps {
  initial?: FamilyMemberDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { name: string; color: string | null }) => void
}

export function FamilyMemberForm({ initial, submitLabel, isPending, onSubmit }: FamilyMemberFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="member-name">Name</Label>
        <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Choose color ${swatch}`}
              onClick={() => setColor(swatch)}
              className="size-8 rounded-full ring-offset-2 ring-offset-background transition"
              style={{ backgroundColor: swatch, outline: color === swatch ? `2px solid ${swatch}` : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" disabled={!name.trim() || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
