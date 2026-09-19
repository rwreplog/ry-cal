import { useQuery } from '@tanstack/react-query'
import { fetchAvailableCalendars } from '@/services/api/calendarApi'

export function useAvailableCalendars(enabled: boolean) {
  return useQuery({
    queryKey: ['available-calendars'],
    queryFn: ({ signal }) => fetchAvailableCalendars(signal),
    enabled,
  })
}
