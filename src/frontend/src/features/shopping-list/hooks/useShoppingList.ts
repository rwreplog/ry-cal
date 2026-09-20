import { useQuery } from '@tanstack/react-query'
import { fetchShoppingListItems } from '@/services/api/shoppingListApi'

export const shoppingListQueryKey = ['shopping-list'] as const

export function useShoppingList() {
  return useQuery({
    queryKey: shoppingListQueryKey,
    queryFn: ({ signal }) => fetchShoppingListItems(signal),
  })
}
