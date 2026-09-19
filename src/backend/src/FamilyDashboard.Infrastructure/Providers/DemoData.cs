using FamilyDashboard.Application.Dashboard.Dtos;

namespace FamilyDashboard.Infrastructure.Providers;

// Static demo data for the Phase 0 dashboard shell. Replaced by real provider
// implementations (Google Calendar, weather API, ...) behind the same interfaces
// as later roadmap phases add real integrations.
internal static class DemoData
{
    public static IReadOnlyList<CalendarEventDto> BuildUpcomingEvents(DateTimeOffset now) =>
    [
        new CalendarEventDto(
            "evt-1",
            "Soccer practice",
            now.AddHours(3),
            now.AddHours(4.5),
            "Community Field"),
        new CalendarEventDto(
            "evt-2",
            "Family dinner",
            now.AddHours(7),
            now.AddHours(8),
            "Home"),
        new CalendarEventDto(
            "evt-3",
            "Dentist appointment",
            now.AddDays(1).AddHours(2),
            now.AddDays(1).AddHours(3),
            "Dr. Lee's Office"),
    ];

    public static WeatherSnapshotDto BuildCurrentConditions() =>
        new(TemperatureF: 68, Condition: "Partly cloudy", HighF: 74, LowF: 58);

    public static IReadOnlyList<AnnouncementDto> BuildActiveAnnouncements(DateTimeOffset now) =>
    [
        new AnnouncementDto(
            "ann-1",
            "Grandma's visiting this weekend!",
            now.AddDays(-1),
            "Mom"),
        new AnnouncementDto(
            "ann-2",
            "Trash pickup moved to Wednesday this week.",
            now.AddHours(-6),
            "Dad"),
    ];
}
