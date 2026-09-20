import type { DashboardConfigDto, DashboardDto, UpdateDashboardConfigRequest } from '@/types/dashboard'
import { apiGet, apiPut } from './httpClient'

export function fetchDashboard(signal?: AbortSignal): Promise<DashboardDto> {
  return apiGet<DashboardDto>('/api/dashboard', signal)
}

export function fetchDashboardConfig(signal?: AbortSignal): Promise<DashboardConfigDto> {
  return apiGet<DashboardConfigDto>('/api/dashboard/config', signal)
}

export function updateDashboardConfig(request: UpdateDashboardConfigRequest): Promise<DashboardConfigDto> {
  return apiPut<DashboardConfigDto>('/api/dashboard/config', request)
}
