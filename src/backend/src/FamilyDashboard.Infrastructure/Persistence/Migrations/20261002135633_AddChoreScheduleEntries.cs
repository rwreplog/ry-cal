using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyDashboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChoreScheduleEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChoreScheduleEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChoreId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    AssignedToFamilyMemberId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChoreScheduleEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChoreScheduleEntries_Chores_ChoreId",
                        column: x => x.ChoreId,
                        principalTable: "Chores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChoreScheduleEntries_FamilyMembers_AssignedToFamilyMemberId",
                        column: x => x.AssignedToFamilyMemberId,
                        principalTable: "FamilyMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChoreScheduleEntries_AssignedToFamilyMemberId",
                table: "ChoreScheduleEntries",
                column: "AssignedToFamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_ChoreScheduleEntries_ChoreId_DayOfWeek",
                table: "ChoreScheduleEntries",
                columns: new[] { "ChoreId", "DayOfWeek" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChoreScheduleEntries");
        }
    }
}
