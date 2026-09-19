namespace FamilyDashboard.Application.Common;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }

    string? UserId { get; }

    string? FamilyId { get; }
}
