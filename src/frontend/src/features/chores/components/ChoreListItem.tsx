import { useState } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { useChoreMutations } from '@/features/chores/hooks/useChoreMutations'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreDto } from '@/types/chores'
import { ChoreForm } from './ChoreForm'

const RECURRENCE_LABEL: Record<ChoreDto['recurrence'], string> = {
  none: 'One-off',
  daily: 'Daily',
  weekly: 'Weekly',
  weekdays: 'Specific days',
}

const DAY_ABBREVIATION: Record<string, string> = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
}

const DAY_ORDER = Object.keys(DAY_ABBREVIATION)

// e.g. "Mon → Ryan, Wed → Victoria, Fri → Unassigned"
function scheduleSummary(schedule: ChoreDto['schedule']): string {
  return [...schedule]
    .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    .map((e) => `${DAY_ABBREVIATION[e.dayOfWeek]} → ${e.familyMemberName ?? 'Unassigned'}`)
    .join(', ')
}

const UNASSIGNED = 'unassigned'

export function ChoreListItem({ chore }: { chore: ChoreDto }) {
  const [editOpen, setEditOpen] = useState(false)
  const { update, remove, complete, assign } = useChoreMutations()
  const { data: members } = useFamilyMembers()

  const isWeekdays = chore.recurrence === 'weekdays'
  const canComplete = Boolean(chore.assignedToFamilyMemberId) && !chore.isComplete

  return (
    <div className="flex items-start gap-3 rounded-2xl border p-4">
      {/* A "specific days" chore has no single occurrence to complete from a
          definition-level row — that happens from the dashboard/calendar widgets,
          which show one row per live day. */}
      {!isWeekdays && (
        <button
          type="button"
          aria-label={chore.isComplete ? `${chore.title} is complete` : `Mark ${chore.title} complete`}
          disabled={!canComplete}
          onClick={() =>
            chore.assignedToFamilyMemberId &&
            complete.mutate({ id: chore.id, request: { familyMemberId: chore.assignedToFamilyMemberId } })
          }
          className="mt-0.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {chore.isComplete ? (
            <CheckCircle2 className="size-5 text-emerald-500" />
          ) : (
            <Circle className="text-muted-foreground size-5" />
          )}
        </button>
      )}

      <button type="button" className="flex-1 text-left" onClick={() => setEditOpen(true)}>
        <p className={chore.isComplete ? 'text-muted-foreground font-medium line-through' : 'font-medium'}>{chore.title}</p>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">{RECURRENCE_LABEL[chore.recurrence]}</Badge>
          {isWeekdays ? (
            <span>{scheduleSummary(chore.schedule)}</span>
          ) : (
            <span>{new Date(chore.dueAtUtc).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
          )}
        </div>
      </button>

      {!isWeekdays && (
        <Select
          value={chore.assignedToFamilyMemberId ?? UNASSIGNED}
          onValueChange={(value) =>
            assign.mutate({ id: chore.id, request: { familyMemberId: value === UNASSIGNED ? null : value } })
          }
        >
          <SelectTrigger size="sm" aria-label={`Reassign ${chore.title}`} onClick={(e) => e.stopPropagation()}>
            <SelectValue placeholder="Unassigned" />
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
      )}

      <DeleteConfirmDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${chore.title}`} disabled={remove.isPending}>
            <Trash2 className="size-4" />
          </Button>
        }
        title={`Delete "${chore.title}"?`}
        onConfirm={() => remove.mutate(chore.id)}
      />

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Edit chore</SheetTitle>
          </SheetHeader>
          <ChoreForm
            initial={chore}
            submitLabel="Save changes"
            isPending={update.isPending}
            onSubmit={(values) =>
              update.mutate(
                {
                  id: chore.id,
                  request: {
                    title: values.title,
                    description: values.description,
                    recurrence: values.recurrence,
                    dueAtUtc: values.dueAtUtc,
                    schedule: values.schedule,
                  },
                },
                { onSuccess: () => setEditOpen(false) },
              )
            }
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
