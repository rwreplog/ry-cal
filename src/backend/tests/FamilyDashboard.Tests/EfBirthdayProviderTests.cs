using FamilyDashboard.Infrastructure.Providers;

namespace FamilyDashboard.Tests;

public class EfBirthdayProviderTests
{
    [Fact]
    public void DaysUntilNextBirthday_LaterThisYear_CountsForward()
    {
        var today = new DateOnly(2026, 1, 1);
        var birthDate = new DateOnly(1990, 1, 15);

        Assert.Equal(14, EfBirthdayProvider.DaysUntilNextBirthday(birthDate, today));
    }

    [Fact]
    public void DaysUntilNextBirthday_Today_IsZero()
    {
        var today = new DateOnly(2026, 6, 15);
        var birthDate = new DateOnly(1990, 6, 15);

        Assert.Equal(0, EfBirthdayProvider.DaysUntilNextBirthday(birthDate, today));
    }

    [Fact]
    public void DaysUntilNextBirthday_AlreadyPassedThisYear_WrapsToNextYear()
    {
        // A January birthday, viewed from December, should read as "coming up soon"
        // in the new year, not hundreds of days in the past.
        var today = new DateOnly(2026, 12, 20);
        var birthDate = new DateOnly(1990, 1, 5);

        Assert.Equal(16, EfBirthdayProvider.DaysUntilNextBirthday(birthDate, today));
    }

    [Fact]
    public void DaysUntilNextBirthday_Feb29InANonLeapTargetYear_ObservesOnFeb28()
    {
        var today = new DateOnly(2027, 2, 1); // 2027 is not a leap year
        var birthDate = new DateOnly(1992, 2, 29);

        Assert.Equal(27, EfBirthdayProvider.DaysUntilNextBirthday(birthDate, today));
    }
}
