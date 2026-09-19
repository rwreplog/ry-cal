using Microsoft.AspNetCore.DataProtection;

namespace FamilyDashboard.Api.Extensions;

public static class DataProtectionExtensions
{
    public static IServiceCollection AddAppDataProtection(this IServiceCollection services, IConfiguration configuration)
    {
        var builder = services.AddDataProtection().SetApplicationName("ReplogleHQ");

        var keyRingPath = configuration["DataProtection:KeyRingPath"];
        if (!string.IsNullOrWhiteSpace(keyRingPath))
        {
            builder.PersistKeysToFileSystem(new DirectoryInfo(keyRingPath));
        }

        return services;
    }
}
