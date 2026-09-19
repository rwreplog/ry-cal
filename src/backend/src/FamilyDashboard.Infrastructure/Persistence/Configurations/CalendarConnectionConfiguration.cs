using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class CalendarConnectionConfiguration : IEntityTypeConfiguration<CalendarConnection>
{
    public void Configure(EntityTypeBuilder<CalendarConnection> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Provider).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.ConnectedEmail).HasMaxLength(320);
        builder.Property(c => c.CalendarId).IsRequired().HasMaxLength(500).HasDefaultValue("primary");
        builder.Property(c => c.AccessTokenEncrypted);
        builder.Property(c => c.RefreshTokenEncrypted);
        builder.Property(c => c.IcsUrl).HasMaxLength(2000);

        builder.HasIndex(c => c.FamilyId).IsUnique();

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(c => c.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
