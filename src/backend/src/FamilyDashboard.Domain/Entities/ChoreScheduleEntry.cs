namespace FamilyDashboard.Domain.Entities;

// Only meaningful for a Chore with Recurrence == Weekdays — one row per scheduled
// day of the week, each with its own (optional) assignee.
public sealed class ChoreScheduleEntry
{
    public Guid Id { get; init; }
    public required Guid ChoreId { get; set; }
    public required DayOfWeek DayOfWeek { get; set; }
    public Guid? AssignedToFamilyMemberId { get; set; }
}
