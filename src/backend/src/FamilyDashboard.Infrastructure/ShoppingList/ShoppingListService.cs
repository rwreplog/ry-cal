using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.ShoppingList;
using FamilyDashboard.Application.ShoppingList.Dtos;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.ShoppingList;

public sealed class ShoppingListService(AppDbContext db, ICurrentUserService currentUser) : IShoppingListService
{
    public async Task<IReadOnlyList<ShoppingListItemDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();

        return await db.ShoppingListItems
            .Where(i => i.FamilyId == familyId)
            .OrderBy(i => i.IsChecked)
            .ThenBy(i => i.CreatedAtUtc)
            .Select(i => new ShoppingListItemDto(i.Id, i.Name, i.IsChecked))
            .ToListAsync(cancellationToken);
    }

    public async Task<ShoppingListItemDto> CreateAsync(CreateShoppingListItemRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var item = new ShoppingListItem
        {
            Id = Guid.NewGuid(),
            FamilyId = CurrentFamilyId(),
            Name = request.Name.Trim(),
            IsChecked = false,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        db.ShoppingListItems.Add(item);
        await db.SaveChangesAsync(cancellationToken);

        return new ShoppingListItemDto(item.Id, item.Name, item.IsChecked);
    }

    public async Task<ShoppingListItemDto?> UpdateAsync(Guid id, UpdateShoppingListItemRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request));
        }

        var item = await FindItemAsync(id, cancellationToken);
        if (item is null)
        {
            return null;
        }

        item.Name = request.Name.Trim();
        await db.SaveChangesAsync(cancellationToken);

        return new ShoppingListItemDto(item.Id, item.Name, item.IsChecked);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await FindItemAsync(id, cancellationToken);
        if (item is null)
        {
            return false;
        }

        db.ShoppingListItems.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ShoppingListItemDto?> ToggleCheckedAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await FindItemAsync(id, cancellationToken);
        if (item is null)
        {
            return null;
        }

        item.IsChecked = !item.IsChecked;
        await db.SaveChangesAsync(cancellationToken);

        return new ShoppingListItemDto(item.Id, item.Name, item.IsChecked);
    }

    public async Task ClearCheckedAsync(CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        var checkedItems = await db.ShoppingListItems
            .Where(i => i.FamilyId == familyId && i.IsChecked)
            .ToListAsync(cancellationToken);

        db.ShoppingListItems.RemoveRange(checkedItems);
        await db.SaveChangesAsync(cancellationToken);
    }

    private Task<ShoppingListItem?> FindItemAsync(Guid id, CancellationToken cancellationToken)
    {
        var familyId = CurrentFamilyId();
        return db.ShoppingListItems.FirstOrDefaultAsync(i => i.Id == id && i.FamilyId == familyId, cancellationToken);
    }

    private Guid CurrentFamilyId() =>
        currentUser.FamilyId is { } id && Guid.TryParse(id, out var parsed)
            ? parsed
            : throw new InvalidOperationException("No current family context is available.");
}
