using FamilyDashboard.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FamilyDashboard.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Chore> Chores => Set<Chore>();
    public DbSet<ChoreCompletion> ChoreCompletions => Set<ChoreCompletion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
