import { useQuery } from '@tanstack/react-query'
import { fetchCompletionHistory } from '@/services/api/choresApi'

export function useCompletionHistory(params: { choreId?: string; familyMemberId?: string; take?: number } = {}) {
  return useQuery({
    queryKey: ['chore-completions', params],
    queryFn: ({ signal }) => fetchCompletionHistory(params, signal),
  })
}
