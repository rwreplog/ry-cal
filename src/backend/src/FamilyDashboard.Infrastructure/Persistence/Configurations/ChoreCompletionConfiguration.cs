using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class ChoreCompletionConfiguration : IEntityTypeConfiguration<ChoreCompletion>
{
    public void Configure(EntityTypeBuilder<ChoreCompletion> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.ChoreId);
        builder.HasIndex(c => c.FamilyMemberId);

        builder.HasOne<Chore>()
            .WithMany()
            .HasForeignKey(c => c.ChoreId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<FamilyMember>()
            .WithMany()
            .HasForeignKey(c => c.FamilyMemberId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
