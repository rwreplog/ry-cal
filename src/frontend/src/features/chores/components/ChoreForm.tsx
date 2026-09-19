import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto, RecurrenceType } from '@/types/chores'

const UNASSIGNED = 'unassigned'

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDateTimeLocal(value: string): string {
  return new Date(value).toISOString()
}

function defaultDueAt(): string {
  const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000)
  return toDateTimeLocal(inTwoHours.toISOString())
}

interface ChoreFormProps {
  initial?: ChoreDto
  submitLabel: string
  isPending: boolean
  onSubmit: (values: {
    title: string
    description: string | null
    assignedToFamilyMemberId: string | null
    recurrence: RecurrenceType
    dueAtUtc: string
  }) => void
}

// The assignee picker only appears when creating a chore (CreateChoreRequest carries
// an assignee). Editing an existing chore only touches title/description/recurrence/due
// date — reassignment is its own action (PATCH .../assign), exposed as a separate
// control on the chore list item, not folded into this form.
export function ChoreForm({ initial, submitLabel, isPending, onSubmit }: ChoreFormProps) {
  const { data: members } = useFamilyMembers()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [assignedTo, setAssignedTo] = useState(initial?.assignedToFamilyMemberId ?? UNASSIGNED)
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initial?.recurrence ?? 'none')
  const [dueAtLocal, setDueAtLocal] = useState(initial ? toDateTimeLocal(initial.dueAtUtc) : defaultDueAt())

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !dueAtLocal) return
    onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      assignedToFamilyMemberId: assignedTo === UNASSIGNED ? null : assignedTo,
      recurrence,
      dueAtUtc: fromDateTimeLocal(dueAtLocal),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-title">Title</Label>
        <Input id="chore-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Take out the trash" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-description">Description (optional)</Label>
        <Input id="chore-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {!initial && (
        <div className="flex flex-col gap-2">
          <Label>Assigned to</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {members?.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Repeats</Label>
        <Select value={recurrence} onValueChange={(value) => setRecurrence(value as RecurrenceType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Never (one-off)</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-due">Due</Label>
        <Input
          id="chore-due"
          type="datetime-local"
          value={dueAtLocal}
          onChange={(e) => setDueAtLocal(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={!title.trim() || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
