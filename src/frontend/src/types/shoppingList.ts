export interface ShoppingListItemDto {
  id: string
  name: string
  isChecked: boolean
}

export interface CreateShoppingListItemRequest {
  name: string
}

export interface UpdateShoppingListItemRequest {
  name: string
}
