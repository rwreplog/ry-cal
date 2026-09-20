using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Application.Providers;

// Returns the whole section DTO (not just a list, unlike the other providers) since
// the dashboard needs both the capped item list and the total unchecked count (for
// a "+N more" indicator) in one round trip.
public interface IShoppingListProvider
{
    Task<ShoppingListSectionDto> GetUncheckedItemsAsync(CancellationToken cancellationToken);
}
