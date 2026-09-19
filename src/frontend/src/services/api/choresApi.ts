import type {
  AssignChoreRequest,
  ChoreCompletionDto,
  ChoreDto,
  CompleteChoreRequest,
  CreateChoreRequest,
  UpdateChoreRequest,
} from '@/types/chores'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './httpClient'

export function fetchChores(signal?: AbortSignal): Promise<ChoreDto[]> {
  return apiGet<ChoreDto[]>('/api/chores', signal)
}

export function createChore(request: CreateChoreRequest): Promise<ChoreDto> {
  return apiPost<ChoreDto>('/api/chores', request)
}

export function updateChore(id: string, request: UpdateChoreRequest): Promise<ChoreDto> {
  return apiPut<ChoreDto>(`/api/chores/${id}`, request)
}

export function deleteChore(id: string): Promise<void> {
  return apiDelete<void>(`/api/chores/${id}`)
}

export function assignChore(id: string, request: AssignChoreRequest): Promise<ChoreDto> {
  return apiPatch<ChoreDto>(`/api/chores/${id}/assign`, request)
}

export function completeChore(id: string, request: CompleteChoreRequest): Promise<ChoreDto> {
  return apiPost<ChoreDto>(`/api/chores/${id}/complete`, request)
}

export function fetchCompletionHistory(
  params: { choreId?: string; familyMemberId?: string; take?: number } = {},
  signal?: AbortSignal,
): Promise<ChoreCompletionDto[]> {
  const query = new URLSearchParams()
  if (params.choreId) query.set('choreId', params.choreId)
  if (params.familyMemberId) query.set('familyMemberId', params.familyMemberId)
  if (params.take) query.set('take', String(params.take))

  const queryString = query.toString()
  return apiGet<ChoreCompletionDto[]>(`/api/chores/completions${queryString ? `?${queryString}` : ''}`, signal)
}
