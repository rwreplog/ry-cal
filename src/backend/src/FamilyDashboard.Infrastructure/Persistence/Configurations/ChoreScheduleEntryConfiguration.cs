using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class ChoreScheduleEntryConfiguration : IEntityTypeConfiguration<ChoreScheduleEntry>
{
    public void Configure(EntityTypeBuilder<ChoreScheduleEntry> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DayOfWeek).HasConversion<string>().HasMaxLength(10);

        builder.HasIndex(e => new { e.ChoreId, e.DayOfWeek }).IsUnique();

        builder.HasOne<Chore>()
            .WithMany()
            .HasForeignKey(e => e.ChoreId)
            .OnDelete(DeleteBehavior.Cascade);

        // SetNull, not Restrict (unlike ChoreCompletion's FamilyMember FK) — matches
        // ChoreConfiguration's own assignee FK: a scheduled day should survive a
        // member being deleted, just falling back to unassigned.
        builder.HasOne<FamilyMember>()
            .WithMany()
            .HasForeignKey(e => e.AssignedToFamilyMemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
