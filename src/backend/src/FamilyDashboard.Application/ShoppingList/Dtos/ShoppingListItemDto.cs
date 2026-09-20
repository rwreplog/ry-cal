namespace FamilyDashboard.Application.ShoppingList.Dtos;

public sealed record ShoppingListItemDto(Guid Id, string Name, bool IsChecked);

public sealed record CreateShoppingListItemRequest(string Name);

public sealed record UpdateShoppingListItemRequest(string Name);
