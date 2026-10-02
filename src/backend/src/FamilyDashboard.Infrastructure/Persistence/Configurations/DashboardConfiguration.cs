using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class DashboardConfiguration : IEntityTypeConfiguration<Dashboard>
{
    public void Configure(EntityTypeBuilder<Dashboard> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Theme).IsRequired().HasMaxLength(30).HasDefaultValue("modern");
        builder.Property(d => d.CalendarView).IsRequired().HasMaxLength(20).HasDefaultValue("week");
        builder.Property(d => d.LocationLabel).HasMaxLength(200);

        builder.HasIndex(d => d.FamilyId).IsUnique();

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(d => d.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
