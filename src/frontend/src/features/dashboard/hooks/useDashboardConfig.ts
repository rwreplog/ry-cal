import { useQuery } from '@tanstack/react-query'
import { fetchDashboardConfig } from '@/services/api/dashboardApi'

export const dashboardConfigQueryKey = ['dashboard', 'config'] as const

export function useDashboardConfig() {
  return useQuery({
    queryKey: dashboardConfigQueryKey,
    queryFn: ({ signal }) => fetchDashboardConfig(signal),
    // This only changes via this app's own Save action, never needs background
    // polling — staleTime: Infinity lets a settings page safely seed local
    // drag/edit state from it once, with no risk of a refetch clobbering
    // in-progress edits.
    staleTime: Infinity,
  })
}
