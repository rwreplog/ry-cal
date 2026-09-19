import type { CreateFamilyMemberRequest, FamilyMemberDto, UpdateFamilyMemberRequest } from '@/types/family'
import { apiDelete, apiGet, apiPost, apiPut } from './httpClient'

export function fetchFamilyMembers(signal?: AbortSignal): Promise<FamilyMemberDto[]> {
  return apiGet<FamilyMemberDto[]>('/api/family-members', signal)
}

export function createFamilyMember(request: CreateFamilyMemberRequest): Promise<FamilyMemberDto> {
  return apiPost<FamilyMemberDto>('/api/family-members', request)
}

export function updateFamilyMember(id: string, request: UpdateFamilyMemberRequest): Promise<FamilyMemberDto> {
  return apiPut<FamilyMemberDto>(`/api/family-members/${id}`, request)
}

export function deleteFamilyMember(id: string): Promise<void> {
  return apiDelete<void>(`/api/family-members/${id}`)
}
