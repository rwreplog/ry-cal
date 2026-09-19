import { useQuery } from '@tanstack/react-query'
import { fetchFamilyMembers } from '@/services/api/familyMembersApi'

export const familyMembersQueryKey = ['family-members'] as const

export function useFamilyMembers() {
  return useQuery({
    queryKey: familyMembersQueryKey,
    queryFn: ({ signal }) => fetchFamilyMembers(signal),
  })
}
