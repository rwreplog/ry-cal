import { useMutation, useQueryClient } from '@tanstack/react-query'
import { connectIcsCalendar, disconnectCalendar, updateSelectedCalendar } from '@/services/api/calendarApi'
import type { ConnectIcsRequest, UpdateSelectedCalendarRequest } from '@/types/calendar'
import { calendarConnectionQueryKey } from './useCalendarConnection'

export function useCalendarConnectionMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: calendarConnectionQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const disconnect = useMutation({
    mutationFn: (id: string) => disconnectCalendar(id),
    onSuccess: invalidate,
  })

  const selectCalendar = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSelectedCalendarRequest }) => updateSelectedCalendar(id, request),
    onSuccess: invalidate,
  })

  const connectIcs = useMutation({
    mutationFn: (request: ConnectIcsRequest) => connectIcsCalendar(request),
    onSuccess: invalidate,
  })

  return { disconnect, selectCalendar, connectIcs }
}
