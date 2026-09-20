import { useQuery } from '@tanstack/react-query'
import { fetchAnnouncements } from '@/services/api/announcementsApi'

export const announcementsQueryKey = ['announcements'] as const

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementsQueryKey,
    queryFn: ({ signal }) => fetchAnnouncements(signal),
  })
}
