import type { BirthdayDto, CreateBirthdayRequest, UpdateBirthdayRequest } from '@/types/birthdays'
import { apiDelete, apiGet, apiPost, apiPut } from './httpClient'

export function fetchBirthdays(signal?: AbortSignal): Promise<BirthdayDto[]> {
  return apiGet<BirthdayDto[]>('/api/birthdays', signal)
}

export function createBirthday(request: CreateBirthdayRequest): Promise<BirthdayDto> {
  return apiPost<BirthdayDto>('/api/birthdays', request)
}

export function updateBirthday(id: string, request: UpdateBirthdayRequest): Promise<BirthdayDto> {
  return apiPut<BirthdayDto>(`/api/birthdays/${id}`, request)
}

export function deleteBirthday(id: string): Promise<void> {
  return apiDelete<void>(`/api/birthdays/${id}`)
}
