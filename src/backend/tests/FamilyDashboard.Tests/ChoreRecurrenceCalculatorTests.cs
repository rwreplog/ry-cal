using FamilyDashboard.Application.Chores;
using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Tests;

public class ChoreRecurrenceCalculatorTests
{
    [Fact]
    public void ComputeNextDueAtUtc_None_ReturnsUnchangedDueDate()
    {
        var due = new DateTimeOffset(2026, 1, 1, 9, 0, 0, TimeSpan.Zero);
        var now = new DateTimeOffset(2026, 1, 1, 10, 0, 0, TimeSpan.Zero);

        var next = ChoreRecurrenceCalculator.ComputeNextDueAtUtc(RecurrenceType.None, due, now);

        Assert.Equal(due, next);
    }

    [Fact]
    public void ComputeNextDueAtUtc_Daily_RollsOneDayFromDueDate_WhenNotOverdue()
    {
        var now = new DateTimeOffset(2026, 1, 1, 8, 0, 0, TimeSpan.Zero);
        var due = new DateTimeOffset(2026, 1, 1, 20, 0, 0, TimeSpan.Zero); // still in the future

        var next = ChoreRecurrenceCalculator.ComputeNextDueAtUtc(RecurrenceType.Daily, due, now);

        Assert.Equal(due.AddDays(1), next);
    }

    [Fact]
    public void ComputeNextDueAtUtc_Weekly_KeepsTheSameWeekday_WhenCompletedLate()
    {
        var due = new DateTimeOffset(2025, 12, 25, 9, 0, 0, TimeSpan.Zero); // a Thursday, 3 days overdue
        var now = new DateTimeOffset(2025, 12, 28, 9, 0, 0, TimeSpan.Zero);

        var next = ChoreRecurrenceCalculator.ComputeNextDueAtUtc(RecurrenceType.Weekly, due, now);

        Assert.Equal(due.AddDays(7), next);
        Assert.Equal(DayOfWeek.Thursday, next.DayOfWeek);
    }

    [Fact]
    public void ComputeNextDueAtUtc_Daily_SkipsMissedDaysToNextFutureOccurrence()
    {
        var due = new DateTimeOffset(2025, 12, 25, 9, 0, 0, TimeSpan.Zero);
        var now = new DateTimeOffset(2025, 12, 28, 10, 0, 0, TimeSpan.Zero);

        var next = ChoreRecurrenceCalculator.ComputeNextDueAtUtc(RecurrenceType.Daily, due, now);

        Assert.Equal(new DateTimeOffset(2025, 12, 29, 9, 0, 0, TimeSpan.Zero), next);
    }
}
