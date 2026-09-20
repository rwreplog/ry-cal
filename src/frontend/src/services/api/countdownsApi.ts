import type { CountdownDto, CreateCountdownRequest, UpdateCountdownRequest } from '@/types/countdowns'
import { apiDelete, apiGet, apiPost, apiPut } from './httpClient'

export function fetchCountdowns(signal?: AbortSignal): Promise<CountdownDto[]> {
  return apiGet<CountdownDto[]>('/api/countdowns', signal)
}

export function createCountdown(request: CreateCountdownRequest): Promise<CountdownDto> {
  return apiPost<CountdownDto>('/api/countdowns', request)
}

export function updateCountdown(id: string, request: UpdateCountdownRequest): Promise<CountdownDto> {
  return apiPut<CountdownDto>(`/api/countdowns/${id}`, request)
}

export function deleteCountdown(id: string): Promise<void> {
  return apiDelete<void>(`/api/countdowns/${id}`)
}
