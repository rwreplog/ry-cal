using FamilyDashboard.Infrastructure.Providers;

namespace FamilyDashboard.Tests;

public class OpenMeteoWeatherProviderTests
{
    [Theory]
    [InlineData(0, "Clear sky")]
    [InlineData(2, "Partly cloudy")]
    [InlineData(3, "Overcast")]
    [InlineData(61, "Rain")]
    [InlineData(71, "Snow")]
    [InlineData(95, "Thunderstorm")]
    public void DescribeWeatherCode_MapsKnownWmoCodes(int code, string expected)
    {
        Assert.Equal(expected, OpenMeteoWeatherProvider.DescribeWeatherCode(code));
    }

    [Fact]
    public void DescribeWeatherCode_ReturnsUnknownForAnUnmappedCode()
    {
        Assert.Equal("Unknown", OpenMeteoWeatherProvider.DescribeWeatherCode(-1));
    }

    [Theory]
    [InlineData(0, false)] // Clear sky
    [InlineData(1, false)] // Mainly clear
    [InlineData(2, false)] // Partly cloudy
    [InlineData(3, false)] // Overcast
    [InlineData(45, false)] // Fog — a visibility hazard, not "inclement"
    [InlineData(48, false)] // Depositing rime fog
    [InlineData(51, true)] // Drizzle
    [InlineData(61, true)] // Rain
    [InlineData(71, true)] // Snow
    [InlineData(80, true)] // Rain showers
    [InlineData(95, true)] // Thunderstorm
    [InlineData(99, true)] // Thunderstorm with hail
    public void IsInclementWeather_ClassifiesPrecipitationCodesAsInclement(int code, bool expected)
    {
        Assert.Equal(expected, OpenMeteoWeatherProvider.IsInclementWeather(code));
    }
}
