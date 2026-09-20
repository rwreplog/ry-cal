import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBirthday, deleteBirthday, updateBirthday } from '@/services/api/birthdaysApi'
import type { CreateBirthdayRequest, UpdateBirthdayRequest } from '@/types/birthdays'
import { birthdaysQueryKey } from './useBirthdays'

export function useBirthdayMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: birthdaysQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateBirthdayRequest) => createBirthday(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateBirthdayRequest }) => updateBirthday(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteBirthday(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
