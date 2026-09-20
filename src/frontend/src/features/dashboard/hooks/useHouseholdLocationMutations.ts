import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateHouseholdLocation } from '@/services/api/dashboardApi'
import type { UpdateHouseholdLocationRequest } from '@/types/dashboard'
import { householdLocationQueryKey } from './useHouseholdLocation'

export function useHouseholdLocationMutations() {
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: (request: UpdateHouseholdLocationRequest) => updateHouseholdLocation(request),
    onSuccess: (data) => {
      queryClient.setQueryData(householdLocationQueryKey, data)
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: true })
    },
  })

  return { update }
}
