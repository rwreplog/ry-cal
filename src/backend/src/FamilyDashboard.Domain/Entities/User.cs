namespace FamilyDashboard.Domain.Entities;

// Schema-ready for Phase 2 (Google OAuth). No CRUD/API/UI is built against this yet.
public sealed class User
{
    public Guid Id { get; init; }
    public required Guid FamilyId { get; set; }
    public required string Email { get; set; }
    public string? ExternalAuthId { get; set; }
    public Guid? FamilyMemberId { get; set; }
    public DateTimeOffset CreatedAtUtc { get; init; }
}
