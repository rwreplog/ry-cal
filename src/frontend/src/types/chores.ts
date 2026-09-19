export type RecurrenceType = 'none' | 'daily' | 'weekly'

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
}

export interface CreateChoreRequest {
  title: string
  description: string | null
  assignedToFamilyMemberId: string | null
  recurrence: RecurrenceType
  dueAtUtc: string
}

export interface UpdateChoreRequest {
  title: string
  description: string | null
  recurrence: RecurrenceType
  dueAtUtc: string
}

export interface AssignChoreRequest {
  familyMemberId: string | null
}

export interface CompleteChoreRequest {
  familyMemberId: string
}

export interface ChoreCompletionDto {
  id: string
  choreId: string
  choreTitle: string
  familyMemberId: string
  familyMemberName: string
  completedAtUtc: string
}
