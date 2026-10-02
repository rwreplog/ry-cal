import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/services/api/dashboardApi'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
    refetchInterval: 5 * 60 * 1000,
    // A wall-mounted kiosk's tab can be occluded/backgrounded; it should still keep refreshing.
    refetchIntervalInBackground: true,
  })
}
