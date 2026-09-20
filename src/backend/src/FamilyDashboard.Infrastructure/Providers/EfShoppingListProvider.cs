using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class EfShoppingListProvider(AppDbContext db, ICurrentUserService currentUser) : IShoppingListProvider
{
    private const int DashboardItemLimit = 8;

    public async Task<ShoppingListSectionDto> GetUncheckedItemsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return new ShoppingListSectionDto([], 0);
        }

        var uncheckedQuery = db.ShoppingListItems.Where(i => i.FamilyId == familyId && !i.IsChecked);

        var totalCount = await uncheckedQuery.CountAsync(cancellationToken);
        var items = await uncheckedQuery
            .OrderBy(i => i.CreatedAtUtc)
            .Take(DashboardItemLimit)
            .Select(i => new ShoppingListItemSummaryDto(i.Id.ToString(), i.Name))
            .ToListAsync(cancellationToken);

        return new ShoppingListSectionDto(items, totalCount);
    }
}
