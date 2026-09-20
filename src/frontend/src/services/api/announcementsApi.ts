import type { AnnouncementDto, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@/types/announcements'
import { apiDelete, apiGet, apiPost, apiPut } from './httpClient'

export function fetchAnnouncements(signal?: AbortSignal): Promise<AnnouncementDto[]> {
  return apiGet<AnnouncementDto[]>('/api/announcements', signal)
}

export function createAnnouncement(request: CreateAnnouncementRequest): Promise<AnnouncementDto> {
  return apiPost<AnnouncementDto>('/api/announcements', request)
}

export function updateAnnouncement(id: string, request: UpdateAnnouncementRequest): Promise<AnnouncementDto> {
  return apiPut<AnnouncementDto>(`/api/announcements/${id}`, request)
}

export function deleteAnnouncement(id: string): Promise<void> {
  return apiDelete<void>(`/api/announcements/${id}`)
}
