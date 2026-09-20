namespace FamilyDashboard.Application.Announcements.Dtos;

public sealed record AnnouncementDto(Guid Id, string Message, string? PostedBy, DateTimeOffset PostedAtUtc);

public sealed record CreateAnnouncementRequest(string Message, string? PostedBy);

public sealed record UpdateAnnouncementRequest(string Message, string? PostedBy);
