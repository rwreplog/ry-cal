using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class ChoreConfiguration : IEntityTypeConfiguration<Chore>
{
    public void Configure(EntityTypeBuilder<Chore> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Description).HasMaxLength(2000);
        builder.Property(c => c.Recurrence).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(c => c.FamilyId);
        builder.HasIndex(c => c.AssignedToFamilyMemberId);

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(c => c.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<FamilyMember>()
            .WithMany()
            .HasForeignKey(c => c.AssignedToFamilyMemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
