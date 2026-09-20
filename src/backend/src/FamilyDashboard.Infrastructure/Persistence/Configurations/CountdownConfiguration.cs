using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class CountdownConfiguration : IEntityTypeConfiguration<Countdown>
{
    public void Configure(EntityTypeBuilder<Countdown> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Label).IsRequired().HasMaxLength(200);

        builder.HasIndex(c => c.FamilyId);

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(c => c.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
