namespace FamilyDashboard.Application.FamilyMembers.Dtos;

public sealed record FamilyMemberDto(Guid Id, string Name, string? Color);

public sealed record CreateFamilyMemberRequest(string Name, string? Color);

public sealed record UpdateFamilyMemberRequest(string Name, string? Color);
