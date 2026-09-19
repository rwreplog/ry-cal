import type { CalendarConnectionDto, CalendarListItemDto, ConnectIcsRequest, UpdateSelectedCalendarRequest } from '@/types/calendar'
import { apiDelete, apiGet, apiPatch, apiPost } from './httpClient'

export function fetchCalendarConnection(signal?: AbortSignal): Promise<CalendarConnectionDto | null> {
  return apiGet<CalendarConnectionDto | null>('/api/calendar/connections', signal)
}

export function disconnectCalendar(id: string): Promise<void> {
  return apiDelete<void>(`/api/calendar/connections/${id}`)
}

export function fetchAvailableCalendars(signal?: AbortSignal): Promise<CalendarListItemDto[]> {
  return apiGet<CalendarListItemDto[]>('/api/calendar/calendars', signal)
}

export function updateSelectedCalendar(id: string, request: UpdateSelectedCalendarRequest): Promise<CalendarConnectionDto> {
  return apiPatch<CalendarConnectionDto>(`/api/calendar/connections/${id}`, request)
}

export function connectIcsCalendar(request: ConnectIcsRequest): Promise<CalendarConnectionDto> {
  return apiPost<CalendarConnectionDto>('/api/calendar/connect/ics', request)
}
