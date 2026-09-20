using System.Runtime.CompilerServices;

// Lets the test project unit-test small internal pure functions (weather-code
// mapping, birthday days-until math) directly, without making them public API.
[assembly: InternalsVisibleTo("FamilyDashboard.Tests")]
