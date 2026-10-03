namespace FamilyDashboard.Application.Chores;

// Resolves a Weekdays chore's per-day schedule into a concrete occurrence for the
// current week, computed fresh on every request rather than stored — a Weekdays
// chore keeps no DueAtUtc/IsComplete state of its own (see ChoreScheduleEntry).
// Deliberately plain UTC day-of-week arithmetic, not household-timezone-aware —
// matches ChoreRecurrenceCalculator's existing simplification for Daily/Weekly.
public static class ChoreScheduleExpander
{
    public static DateTimeOffset ComputeOccurrenceDueAtUtc(DayOfWeek dayOfWeek, DateTimeOffset dueAtUtc, DateTimeOffset nowUtc)
    {
        var weekStartUtc = nowUtc.Date.AddDays(-(int)nowUtc.DayOfWeek);
        return new DateTimeOffset(weekStartUtc.AddDays((int)dayOfWeek), TimeSpan.Zero) + dueAtUtc.TimeOfDay;
    }
}
