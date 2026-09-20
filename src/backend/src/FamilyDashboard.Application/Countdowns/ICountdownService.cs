using FamilyDashboard.Application.Countdowns.Dtos;

namespace FamilyDashboard.Application.Countdowns;

public interface ICountdownService
{
    Task<IReadOnlyList<CountdownDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<CountdownDto> CreateAsync(CreateCountdownRequest request, CancellationToken cancellationToken);

    Task<CountdownDto?> UpdateAsync(Guid id, UpdateCountdownRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
