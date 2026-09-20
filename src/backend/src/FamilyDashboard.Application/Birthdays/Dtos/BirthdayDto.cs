namespace FamilyDashboard.Application.Birthdays.Dtos;

public sealed record BirthdayDto(Guid Id, string Name, DateOnly Date);

public sealed record CreateBirthdayRequest(string Name, DateOnly Date);

public sealed record UpdateBirthdayRequest(string Name, DateOnly Date);
