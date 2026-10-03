export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'weekdays'

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface ChoreScheduleEntryDto {
  dayOfWeek: DayOfWeek
  familyMemberId: string | null
  familyMemberName: string | null
  familyMemberColor: string | null
}

export interface ChoreScheduleEntryRequest {
  dayOfWeek: DayOfWeek
  familyMemberId: string | null
}

export interface ChoreDto {
  id: string
  title: string
  description: string | null
  assignedToFamilyMemberId: string | null
  assignedToName: string | null
  recurrence: RecurrenceType
  dueAtUtc: string
  isComplete: boolean
  lastCompletedAtUtc: string | null
  // Only populated when recurrence is 'weekdays'; empty otherwise.
  schedule: ChoreScheduleEntryDto[]
}

export interface CreateChoreRequest {
  title: string
  description: string | null
  assignedToFamilyMemberId: string | null
  recurrence: RecurrenceType
  dueAtUtc: string
  // Required (1-7 entries, no duplicate days) when recurrence is 'weekdays'.
  schedule?: ChoreScheduleEntryRequest[]
}

export interface UpdateChoreRequest {
  title: string
  description: string | null
  recurrence: RecurrenceType
  dueAtUtc: string
  schedule?: ChoreScheduleEntryRequest[]
}

export interface AssignChoreRequest {
  familyMemberId: string | null
}

export interface CompleteChoreRequest {
  familyMemberId: string
  // Required to complete a 'weekdays' chore's occurrence for a specific day; the
  // backend ignores it for every other recurrence type.
  occurrenceDueAtUtc?: string
}

export interface ChoreCompletionDto {
  id: string
  choreId: string
  choreTitle: string
  familyMemberId: string
  familyMemberName: string
  completedAtUtc: string
}
