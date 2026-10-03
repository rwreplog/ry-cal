import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto, ChoreScheduleEntryRequest, RecurrenceType } from '@/types/chores'
import { ChoreScheduleEditor } from './ChoreScheduleEditor'

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
    schedule?: ChoreScheduleEntryRequest[]
  }) => void
}

// The assignee picker only appears when creating a non-"specific days" chore
// (CreateChoreRequest carries an assignee). Editing one of those only touches
// title/description/recurrence/due date — reassignment is its own action (PATCH
// .../assign), exposed as a separate control on the chore list item, not folded
// into this form. A "specific days" chore is the one exception: its schedule *is*
// the assignment, and it has to stay editable after creation, so it shows in both
// create and edit here.
export function ChoreForm({ initial, submitLabel, isPending, onSubmit }: ChoreFormProps) {
  const { data: members } = useFamilyMembers()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [assignedTo, setAssignedTo] = useState(initial?.assignedToFamilyMemberId ?? UNASSIGNED)
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initial?.recurrence ?? 'none')
  const [dueAtLocal, setDueAtLocal] = useState(initial ? toDateTimeLocal(initial.dueAtUtc) : defaultDueAt())
  const [schedule, setSchedule] = useState<ChoreScheduleEntryRequest[]>(
    initial?.schedule.map((e) => ({ dayOfWeek: e.dayOfWeek, familyMemberId: e.familyMemberId })) ?? [],
  )

  const isWeekdays = recurrence === 'weekdays'
  const canSubmit = title.trim() && dueAtLocal && (!isWeekdays || schedule.length > 0)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      assignedToFamilyMemberId: assignedTo === UNASSIGNED ? null : assignedTo,
      recurrence,
      dueAtUtc: fromDateTimeLocal(dueAtLocal),
      schedule: isWeekdays ? schedule : undefined,
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

      {!isWeekdays && !initial && (
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
            <SelectItem value="weekdays">Specific days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isWeekdays && <ChoreScheduleEditor value={schedule} onChange={setSchedule} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-due">{isWeekdays ? 'Due time' : 'Due'}</Label>
        <Input
          id="chore-due"
          type="datetime-local"
          value={dueAtLocal}
          onChange={(e) => setDueAtLocal(e.target.value)}
        />
        {isWeekdays && (
          <p className="text-muted-foreground text-sm">Only the time of day is used — it applies to every scheduled day.</p>
        )}
      </div>

      <Button type="submit" disabled={!canSubmit || isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
