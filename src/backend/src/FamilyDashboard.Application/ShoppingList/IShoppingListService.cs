using FamilyDashboard.Application.ShoppingList.Dtos;

namespace FamilyDashboard.Application.ShoppingList;

public interface IShoppingListService
{
    Task<IReadOnlyList<ShoppingListItemDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<ShoppingListItemDto> CreateAsync(CreateShoppingListItemRequest request, CancellationToken cancellationToken);

    Task<ShoppingListItemDto?> UpdateAsync(Guid id, UpdateShoppingListItemRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<ShoppingListItemDto?> ToggleCheckedAsync(Guid id, CancellationToken cancellationToken);

    Task ClearCheckedAsync(CancellationToken cancellationToken);
}
