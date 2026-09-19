using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyDashboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarConnectionCalendarId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CalendarId",
                table: "CalendarConnections",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "primary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalendarId",
                table: "CalendarConnections");
        }
    }
}
