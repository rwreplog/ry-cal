using FamilyDashboard.Application.Chores.Dtos;

namespace FamilyDashboard.Application.Chores;

public interface IChoreService
{
    Task<IReadOnlyList<ChoreDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<ChoreDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ChoreDto> CreateAsync(CreateChoreRequest request, CancellationToken cancellationToken);

    Task<ChoreDto?> UpdateAsync(Guid id, UpdateChoreRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<ChoreDto?> AssignAsync(Guid id, AssignChoreRequest request, CancellationToken cancellationToken);

    Task<ChoreDto?> CompleteAsync(Guid id, CompleteChoreRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<ChoreCompletionDto>> GetCompletionHistoryAsync(
        Guid? choreId, Guid? familyMemberId, int take, CancellationToken cancellationToken);
}
