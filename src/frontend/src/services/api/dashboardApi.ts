import type {
  DashboardConfigDto,
  DashboardDto,
  GeocodingResultDto,
  HouseholdLocationDto,
  UpdateDashboardConfigRequest,
  UpdateHouseholdLocationRequest,
} from '@/types/dashboard'
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

export function fetchHouseholdLocation(signal?: AbortSignal): Promise<HouseholdLocationDto> {
  return apiGet<HouseholdLocationDto>('/api/dashboard/location', signal)
}

export function updateHouseholdLocation(request: UpdateHouseholdLocationRequest): Promise<HouseholdLocationDto> {
  return apiPut<HouseholdLocationDto>('/api/dashboard/location', request)
}

export function searchLocations(query: string, signal?: AbortSignal): Promise<GeocodingResultDto[]> {
  return apiGet<GeocodingResultDto[]>(`/api/dashboard/location/search?q=${encodeURIComponent(query)}`, signal)
}
