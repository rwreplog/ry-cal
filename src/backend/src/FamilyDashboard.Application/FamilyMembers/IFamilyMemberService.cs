using FamilyDashboard.Application.FamilyMembers.Dtos;

namespace FamilyDashboard.Application.FamilyMembers;

public interface IFamilyMemberService
{
    Task<IReadOnlyList<FamilyMemberDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<FamilyMemberDto> CreateAsync(CreateFamilyMemberRequest request, CancellationToken cancellationToken);

    Task<FamilyMemberDto?> UpdateAsync(Guid id, UpdateFamilyMemberRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
