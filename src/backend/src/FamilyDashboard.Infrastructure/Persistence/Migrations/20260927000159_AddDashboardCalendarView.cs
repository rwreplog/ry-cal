using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyDashboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDashboardCalendarView : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CalendarView",
                table: "Dashboards",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "week");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalendarView",
                table: "Dashboards");
        }
    }
}
