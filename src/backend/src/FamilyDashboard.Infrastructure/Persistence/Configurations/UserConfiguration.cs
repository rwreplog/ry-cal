using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyDashboard.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(320);
        builder.Property(u => u.ExternalAuthId).HasMaxLength(200);

        builder.HasIndex(u => u.FamilyId);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.HasOne<Family>()
            .WithMany()
            .HasForeignKey(u => u.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<FamilyMember>()
            .WithMany()
            .HasForeignKey(u => u.FamilyMemberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
