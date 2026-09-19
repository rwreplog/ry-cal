using Microsoft.AspNetCore.DataProtection;

namespace FamilyDashboard.Infrastructure.Security;

public interface ITokenProtector
{
    string Protect(string plaintext);

    string Unprotect(string protectedText);
}

public sealed class CalendarTokenProtector : ITokenProtector
{
    private readonly IDataProtector protector;

    public CalendarTokenProtector(IDataProtectionProvider provider)
    {
        protector = provider.CreateProtector("FamilyDashboard.CalendarTokens.v1");
    }

    public string Protect(string plaintext) => protector.Protect(plaintext);

    public string Unprotect(string protectedText) => protector.Unprotect(protectedText);
}
