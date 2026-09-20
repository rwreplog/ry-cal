namespace FamilyDashboard.Domain.Entities;

public sealed class Announcement
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Message { get; set; }
    public string? PostedBy { get; set; }
    public DateTimeOffset PostedAtUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
