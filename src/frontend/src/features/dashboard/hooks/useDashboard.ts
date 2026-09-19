import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/services/api/dashboardApi'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => fetchDashboard(signal),
    refetchInterval: 5 * 60 * 1000,
  })
}
