using FamilyDashboard.Application.Chores;

namespace FamilyDashboard.Tests;

public class ChoreScheduleExpanderTests
{
    [Fact]
    public void ComputeOccurrenceDueAtUtc_ResolvesToTheCurrentWeeksDate_WithTheChoresTimeOfDay()
    {
        var now = new DateTimeOffset(2026, 10, 2, 12, 0, 0, TimeSpan.Zero); // a Friday
        var dueAt = new DateTimeOffset(2020, 1, 1, 17, 30, 0, TimeSpan.Zero); // only the 5:30 PM matters

        var monday = ChoreScheduleExpander.ComputeOccurrenceDueAtUtc(DayOfWeek.Monday, dueAt, now);

        Assert.Equal(new DateTimeOffset(2026, 9, 28, 17, 30, 0, TimeSpan.Zero), monday);
    }

    [Fact]
    public void ComputeOccurrenceDueAtUtc_CanResolveToADayLaterInTheSameWeek()
    {
        var now = new DateTimeOffset(2026, 10, 2, 12, 0, 0, TimeSpan.Zero); // a Friday

        var saturday = ChoreScheduleExpander.ComputeOccurrenceDueAtUtc(DayOfWeek.Saturday, now, now);

        Assert.Equal(new DateTimeOffset(2026, 10, 3, 12, 0, 0, TimeSpan.Zero), saturday);
    }

    [Fact]
    public void ComputeOccurrenceDueAtUtc_SundayStartsTheWeek()
    {
        var now = new DateTimeOffset(2026, 10, 2, 12, 0, 0, TimeSpan.Zero); // a Friday

        var sunday = ChoreScheduleExpander.ComputeOccurrenceDueAtUtc(DayOfWeek.Sunday, now, now);

        Assert.Equal(new DateTimeOffset(2026, 9, 27, 12, 0, 0, TimeSpan.Zero), sunday);
    }
}
