import { useQuery } from '@tanstack/react-query'
import { fetchChores } from '@/services/api/choresApi'

export const choresQueryKey = ['chores'] as const

export function useChores() {
  return useQuery({
    queryKey: choresQueryKey,
    queryFn: ({ signal }) => fetchChores(signal),
  })
}
