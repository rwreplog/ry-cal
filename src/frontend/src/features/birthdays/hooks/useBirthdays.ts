import { useQuery } from '@tanstack/react-query'
import { fetchBirthdays } from '@/services/api/birthdaysApi'

export const birthdaysQueryKey = ['birthdays'] as const

export function useBirthdays() {
  return useQuery({
    queryKey: birthdaysQueryKey,
    queryFn: ({ signal }) => fetchBirthdays(signal),
  })
}
