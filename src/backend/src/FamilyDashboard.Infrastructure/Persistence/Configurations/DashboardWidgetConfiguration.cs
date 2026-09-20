using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class DashboardWidgetConfiguration : IEntityTypeConfiguration<DashboardWidget>
{
    public void Configure(EntityTypeBuilder<DashboardWidget> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Type).IsRequired().HasMaxLength(50);
        builder.Property(w => w.Size).HasConversion<string>().HasMaxLength(10);

        builder.HasIndex(w => new { w.DashboardId, w.Type }).IsUnique();

        builder.HasOne<Dashboard>()
            .WithMany(d => d.Widgets)
            .HasForeignKey(w => w.DashboardId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
