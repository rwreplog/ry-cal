import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useFamilyMembers } from '@/features/family/hooks/useFamilyMembers'
import type { ChoreScheduleEntryRequest, DayOfWeek } from '@/types/chores'

const UNASSIGNED = 'unassigned'

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
]

interface ChoreScheduleEditorProps {
  value: ChoreScheduleEntryRequest[]
  onChange: (value: ChoreScheduleEntryRequest[]) => void
}

// A day-by-day assignee picker for a "Specific days" (weekdays) recurring chore —
// e.g. "Take out trash": Ryan on Monday, Victoria on Wednesday. Built entirely from
// existing primitives (Switch + Select, the same pair used elsewhere in this app
// for toggles and assignee pickers) — there's no dedicated Checkbox or multi-select
// component in this codebase, and this doesn't need one.
export function ChoreScheduleEditor({ value, onChange }: ChoreScheduleEditorProps) {
  const { data: members } = useFamilyMembers()

  const toggleDay = (day: DayOfWeek, included: boolean) => {
    onChange(included ? [...value, { dayOfWeek: day, familyMemberId: null }] : value.filter((e) => e.dayOfWeek !== day))
  }

  const setAssignee = (day: DayOfWeek, familyMemberId: string | null) => {
    onChange(value.map((e) => (e.dayOfWeek === day ? { ...e, familyMemberId } : e)))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Schedule</Label>
      <div className="flex flex-col gap-2">
        {DAYS.map(({ value: day, label }) => {
          const entry = value.find((e) => e.dayOfWeek === day)
          return (
            <div key={day} className="flex items-center gap-3">
              <Switch
                checked={Boolean(entry)}
                onCheckedChange={(checked) => toggleDay(day, checked)}
                aria-label={`Include ${label}`}
              />
              <span className="w-24 shrink-0 text-sm">{label}</span>
              <Select
                value={entry?.familyMemberId ?? UNASSIGNED}
                onValueChange={(v) => setAssignee(day, v === UNASSIGNED ? null : v)}
                disabled={!entry}
              >
                <SelectTrigger size="sm" className="w-full" aria-label={`${label} assignee`}>
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
