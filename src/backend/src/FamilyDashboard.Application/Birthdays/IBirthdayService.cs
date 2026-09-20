using FamilyDashboard.Application.Birthdays.Dtos;

namespace FamilyDashboard.Application.Birthdays;

public interface IBirthdayService
{
    Task<IReadOnlyList<BirthdayDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<BirthdayDto> CreateAsync(CreateBirthdayRequest request, CancellationToken cancellationToken);

    Task<BirthdayDto?> UpdateAsync(Guid id, UpdateBirthdayRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
