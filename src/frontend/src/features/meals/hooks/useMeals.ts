import { useQuery } from '@tanstack/react-query'
import { fetchMeals } from '@/services/api/mealsApi'

export const mealsQueryKey = ['meals'] as const

export function useMeals() {
  return useQuery({
    queryKey: mealsQueryKey,
    queryFn: ({ signal }) => fetchMeals(signal),
  })
}
