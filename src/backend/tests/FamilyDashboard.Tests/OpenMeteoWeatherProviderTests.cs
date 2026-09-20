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
}
