using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Providers;

public sealed class EfBirthdayProvider(AppDbContext db, ICurrentUserService currentUser, TimeProvider timeProvider) : IBirthdayProvider
{
    private const int UpcomingWindowDays = 30;

    public async Task<IReadOnlyList<UpcomingBirthdayDto>> GetUpcomingBirthdaysAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);

        var all = await db.Birthdays
            .Where(b => b.FamilyId == familyId)
            .Select(b => new { b.Id, b.Name, b.Date })
            .ToListAsync(cancellationToken);

        return all
            .Select(b => new UpcomingBirthdayDto(b.Id.ToString(), b.Name, b.Date, DaysUntilNextBirthday(b.Date, today)))
            .Where(b => b.DaysUntil <= UpcomingWindowDays)
            .OrderBy(b => b.DaysUntil)
            .ToList();
    }

    // Days until the next occurrence of birthDate's month/day, ignoring birthDate's
    // year. Handles year-wraparound (a January birthday looked at from December is
    // "close," not "330 days ago") and Feb 29 in a non-leap target year (observed on
    // Feb 28 instead, since DateOnly's constructor throws for Feb 29 in that case).
    internal static int DaysUntilNextBirthday(DateOnly birthDate, DateOnly today)
    {
        var month = birthDate.Month;
        var day = birthDate.Day;
        if (month == 2 && day == 29 && !DateTime.IsLeapYear(today.Year))
        {
            day = 28;
        }

        var next = new DateOnly(today.Year, month, day);
        if (next < today)
        {
            next = next.AddYears(1);
        }

        return next.DayNumber - today.DayNumber;
    }
}
