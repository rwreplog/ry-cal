import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  assignChore,
  completeChore,
  createChore,
  deleteChore,
  updateChore,
} from '@/services/api/choresApi'
import type {
  AssignChoreRequest,
  CompleteChoreRequest,
  CreateChoreRequest,
  UpdateChoreRequest,
} from '@/types/chores'
import { choresQueryKey } from './useChores'

// Chore changes also affect the dashboard's ChoresWidget, so every mutation
// invalidates both query keys to keep the two views consistent. Completing a
// chore additionally invalidates completion history (ChoreCompletionHistory).
export function useChoreMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: choresQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateChoreRequest) => createChore(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateChoreRequest }) => updateChore(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteChore(id),
    onSuccess: invalidate,
  })

  const assign = useMutation({
    mutationFn: ({ id, request }: { id: string; request: AssignChoreRequest }) => assignChore(id, request),
    onSuccess: invalidate,
  })

  const complete = useMutation({
    mutationFn: ({ id, request }: { id: string; request: CompleteChoreRequest }) => completeChore(id, request),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['chore-completions'] })
    },
  })

  return { create, update, remove, assign, complete }
}
