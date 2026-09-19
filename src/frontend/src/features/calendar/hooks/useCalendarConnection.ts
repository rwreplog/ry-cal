import { useQuery } from '@tanstack/react-query'
import { fetchCalendarConnection } from '@/services/api/calendarApi'

export const calendarConnectionQueryKey = ['calendar-connection'] as const

export function useCalendarConnection() {
  return useQuery({
    queryKey: calendarConnectionQueryKey,
    queryFn: ({ signal }) => fetchCalendarConnection(signal),
  })
}
