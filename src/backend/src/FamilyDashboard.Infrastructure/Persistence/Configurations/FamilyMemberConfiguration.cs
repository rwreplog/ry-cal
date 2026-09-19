using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class FamilyMemberConfiguration : IEntityTypeConfiguration<FamilyMember>
{
    public void Configure(EntityTypeBuilder<FamilyMember> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Name).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Color).HasMaxLength(20);

        builder.HasIndex(m => m.FamilyId);

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
