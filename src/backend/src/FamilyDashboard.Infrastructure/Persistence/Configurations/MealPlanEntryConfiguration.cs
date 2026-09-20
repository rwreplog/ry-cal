using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class MealPlanEntryConfiguration : IEntityTypeConfiguration<MealPlanEntry>
{
    public void Configure(EntityTypeBuilder<MealPlanEntry> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Name).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Description).HasMaxLength(2000);

        builder.HasIndex(m => m.FamilyId);
        // One meal per day — the real guarantee; the service also pre-checks for a
        // friendlier 400 instead of a raw constraint-violation 500.
        builder.HasIndex(m => new { m.FamilyId, m.Date }).IsUnique();

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(m => m.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
