import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ShoppingListItemDto } from '@/types/shoppingList'

interface ShoppingListItemFormProps {
  initial?: ShoppingListItemDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: { name: string }) => void
}

export function ShoppingListItemForm({ initial, submitLabel, isPending, onSubmit }: ShoppingListItemFormProps) {
  const [name, setName] = useState(initial?.name ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="item-name">Item</Label>
        <Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Milk" autoFocus />
      </div>

      <Button type="submit" disabled={!name.trim() || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
