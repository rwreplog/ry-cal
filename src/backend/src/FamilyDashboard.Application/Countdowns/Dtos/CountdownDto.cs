namespace FamilyDashboard.Application.Countdowns.Dtos;

public sealed record CountdownDto(Guid Id, string Label, DateOnly TargetDate);

public sealed record CreateCountdownRequest(string Label, DateOnly TargetDate);

public sealed record UpdateCountdownRequest(string Label, DateOnly TargetDate);
