using FamilyDashboard.Domain.Entities;

namespace FamilyDashboard.Application.Chores;

public static class ChoreRecurrenceCalculator
{
    // Steps forward in whole periods from the existing due date, so a recurring chore
    // keeps its day of the week (and time of day) even when it's completed late —
    // finishing a Wednesday chore on Saturday still schedules it for the next
    // Wednesday, not the next Saturday. An overdue chore still clears to its next
    // future occurrence in one tap instead of requiring several to "catch up".
    public static DateTimeOffset ComputeNextDueAtUtc(RecurrenceType recurrence, DateTimeOffset currentDueAtUtc, DateTimeOffset nowUtc)
    {
        var periodDays = recurrence switch
        {
            RecurrenceType.Daily => 1,
            RecurrenceType.Weekly => 7,
            _ => 0,
        };

        if (periodDays == 0)
        {
            return currentDueAtUtc;
        }

        if (currentDueAtUtc > nowUtc)
        {
            return currentDueAtUtc.AddDays(periodDays);
        }

        var periodsBehind = (long)Math.Floor((nowUtc - currentDueAtUtc).TotalDays / periodDays) + 1;
        return currentDueAtUtc.AddDays(periodsBehind * periodDays);
    }
}
