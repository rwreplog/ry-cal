namespace FamilyDashboard.Domain.Entities;

public enum RecurrenceType
{
    None,
    Daily,
    Weekly,
    // A day-by-day schedule (ChoreScheduleEntry rows), each day optionally with its
    // own assignee — e.g. "Take out trash": Ryan on Monday, Victoria on Wednesday.
    Weekdays,
}
