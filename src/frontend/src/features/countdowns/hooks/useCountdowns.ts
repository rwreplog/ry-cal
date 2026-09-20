import { useQuery } from '@tanstack/react-query'
import { fetchCountdowns } from '@/services/api/countdownsApi'

export const countdownsQueryKey = ['countdowns'] as const

export function useCountdowns() {
  return useQuery({
    queryKey: countdownsQueryKey,
    queryFn: ({ signal }) => fetchCountdowns(signal),
  })
}
