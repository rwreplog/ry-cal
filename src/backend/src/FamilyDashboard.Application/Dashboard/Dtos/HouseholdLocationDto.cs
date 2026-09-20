namespace FamilyDashboard.Application.Dashboard.Dtos;

public sealed record HouseholdLocationDto(double? Latitude, double? Longitude, string? LocationLabel);

public sealed record UpdateHouseholdLocationRequest(double Latitude, double Longitude, string? LocationLabel);

public sealed record GeocodingResultDto(string Name, double Latitude, double Longitude, string? Admin1, string Country);
