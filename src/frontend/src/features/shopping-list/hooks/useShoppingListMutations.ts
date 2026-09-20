import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  clearCheckedShoppingListItems,
  createShoppingListItem,
  deleteShoppingListItem,
  toggleShoppingListItem,
  updateShoppingListItem,
} from '@/services/api/shoppingListApi'
import type { CreateShoppingListItemRequest, UpdateShoppingListItemRequest } from '@/types/shoppingList'
import { shoppingListQueryKey } from './useShoppingList'

export function useShoppingListMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: shoppingListQueryKey })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const create = useMutation({
    mutationFn: (request: CreateShoppingListItemRequest) => createShoppingListItem(request),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateShoppingListItemRequest }) => updateShoppingListItem(id, request),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteShoppingListItem(id),
    onSuccess: invalidate,
  })

  const toggle = useMutation({
    mutationFn: (id: string) => toggleShoppingListItem(id),
    onSuccess: invalidate,
  })

  const clearChecked = useMutation({
    mutationFn: () => clearCheckedShoppingListItems(),
    onSuccess: invalidate,
  })

  return { create, update, remove, toggle, clearChecked }
}
