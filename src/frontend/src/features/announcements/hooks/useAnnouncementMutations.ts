import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/services/api/announcementsApi'
import type { CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@/types/announcements'
import { announcementsQueryKey } from './useAnnouncements'

export function useAnnouncementMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateAnnouncementRequest) => createAnnouncement(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateAnnouncementRequest }) => updateAnnouncement(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
