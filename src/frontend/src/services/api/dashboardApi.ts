import type { DashboardDto } from '@/types/dashboard'
import { apiGet } from './httpClient'

export function fetchDashboard(signal?: AbortSignal): Promise<DashboardDto> {
  return apiGet<DashboardDto>('/api/dashboard', signal)
}
