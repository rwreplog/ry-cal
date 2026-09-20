import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDashboardConfig } from '@/services/api/dashboardApi'
import type { UpdateDashboardConfigRequest } from '@/types/dashboard'
import { dashboardConfigQueryKey } from './useDashboardConfig'

export function useDashboardConfigMutations() {
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: (request: UpdateDashboardConfigRequest) => updateDashboardConfig(request),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardConfigQueryKey, data)
      // exact: true — the plain ['dashboard'] query only, not ['dashboard','config']
      // (a prefix match would re-invalidate the config query we just set above).
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: true })
    },
  })

  return { update }
}
