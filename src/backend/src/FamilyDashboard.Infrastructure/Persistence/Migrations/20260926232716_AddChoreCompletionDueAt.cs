using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyDashboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChoreCompletionDueAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DueAtUtc",
                table: "ChoreCompletions",
                type: "timestamp with time zone",
                nullable: true);

            // One-off chores never move their due date, so their existing completions
            // can be backfilled exactly; recurring ones can't (the original date is gone).
            migrationBuilder.Sql(@"UPDATE ""ChoreCompletions"" cc SET ""DueAtUtc"" = c.""DueAtUtc"" FROM ""Chores"" c WHERE cc.""ChoreId"" = c.""Id"" AND c.""Recurrence"" = 'None';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueAtUtc",
                table: "ChoreCompletions");
        }
    }
}
