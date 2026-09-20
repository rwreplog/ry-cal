import type { CreateShoppingListItemRequest, ShoppingListItemDto, UpdateShoppingListItemRequest } from '@/types/shoppingList'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './httpClient'

export function fetchShoppingListItems(signal?: AbortSignal): Promise<ShoppingListItemDto[]> {
  return apiGet<ShoppingListItemDto[]>('/api/shopping-list', signal)
}

export function createShoppingListItem(request: CreateShoppingListItemRequest): Promise<ShoppingListItemDto> {
  return apiPost<ShoppingListItemDto>('/api/shopping-list', request)
}

export function updateShoppingListItem(id: string, request: UpdateShoppingListItemRequest): Promise<ShoppingListItemDto> {
  return apiPut<ShoppingListItemDto>(`/api/shopping-list/${id}`, request)
}

export function deleteShoppingListItem(id: string): Promise<void> {
  return apiDelete<void>(`/api/shopping-list/${id}`)
}

export function toggleShoppingListItem(id: string): Promise<ShoppingListItemDto> {
  return apiPatch<ShoppingListItemDto>(`/api/shopping-list/${id}/toggle`)
}

export function clearCheckedShoppingListItems(): Promise<void> {
  return apiDelete<void>('/api/shopping-list/checked')
}
