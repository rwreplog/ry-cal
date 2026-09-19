import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFamilyMember, deleteFamilyMember, updateFamilyMember } from '@/services/api/familyMembersApi'
import type { CreateFamilyMemberRequest, UpdateFamilyMemberRequest } from '@/types/family'
import { familyMembersQueryKey } from './useFamilyMembers'

export function useFamilyMemberMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: familyMembersQueryKey })

  const create = useMutation({
    mutationFn: (request: CreateFamilyMemberRequest) => createFamilyMember(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateFamilyMemberRequest }) => updateFamilyMember(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteFamilyMember(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
