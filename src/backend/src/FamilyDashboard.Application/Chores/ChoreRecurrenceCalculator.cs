using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Chores;

public static class ChoreRecurrenceCalculator
{
    // Rolls forward from `now` rather than the stale due date, so completing an
    // overdue recurring chore always clears it to its next natural cycle in one tap
    // instead of requiring several taps to "catch up".
    public static DateTimeOffset ComputeNextDueAtUtc(RecurrenceType recurrence, DateTimeOffset currentDueAtUtc, DateTimeOffset nowUtc)
    {
        var from = currentDueAtUtc > nowUtc ? currentDueAtUtc : nowUtc;

        return recurrence switch
        {
            RecurrenceType.Daily => from.AddDays(1),
            RecurrenceType.Weekly => from.AddDays(7),
            _ => currentDueAtUtc,
        };
    }
}
