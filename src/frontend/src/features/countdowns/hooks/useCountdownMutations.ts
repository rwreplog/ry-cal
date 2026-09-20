import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCountdown, deleteCountdown, updateCountdown } from '@/services/api/countdownsApi'
import type { CreateCountdownRequest, UpdateCountdownRequest } from '@/types/countdowns'
import { countdownsQueryKey } from './useCountdowns'

export function useCountdownMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: countdownsQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateCountdownRequest) => createCountdown(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateCountdownRequest }) => updateCountdown(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteCountdown(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
