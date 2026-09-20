import { useQuery } from '@tanstack/react-query'
import { fetchHouseholdLocation } from '@/services/api/dashboardApi'

export const householdLocationQueryKey = ['household-location'] as const

export function useHouseholdLocation() {
  return useQuery({
    queryKey: householdLocationQueryKey,
    queryFn: ({ signal }) => fetchHouseholdLocation(signal),
  })
}
