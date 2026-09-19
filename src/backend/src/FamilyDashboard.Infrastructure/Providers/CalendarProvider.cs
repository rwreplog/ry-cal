using System.Net.Http.Headers;
using System.Net.Http.Json;
using FamilyDashboard.Application.Common;
using FamilyDashboard.Application.Dashboard.Dtos;
using FamilyDashboard.Application.Providers;
using FamilyDashboard.Domain.Entities;
using FamilyDashboard.Infrastructure.Calendar;
using FamilyDashboard.Infrastructure.Persistence;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Ical.Net.Evaluation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
// Alias: FamilyDashboard.Infrastructure.Calendar (imported below) collides with
// Ical.Net's `Calendar` class name.
using IcsCalendar = Ical.Net.Calendar;

namespace FamilyDashboard.Infrastructure.Providers;

// Real calendar data for the dashboard widget, replacing DemoCalendarProvider now
// that Phase 2 has a real calendar connection — Google Calendar or a public ICS
// feed (e.g. an iCloud shared calendar), whichever the household connected. Returns
// an empty list (never throws) whenever there's no connection yet or the upstream
// source has a transient failure — the dashboard must not break for a household
// that hasn't connected, or when the feed briefly errors.
public sealed class CalendarProvider(
    AppDbContext db,
    GoogleTokenService tokenService,
    ICurrentUserService currentUser,
    IHttpClientFactory httpClientFactory,
    IMemoryCache cache,
    TimeProvider timeProvider) : ICalendarProvider
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public async Task<IReadOnlyList<CalendarEventDto>> GetUpcomingEventsAsync(CancellationToken cancellationToken)
    {
        if (currentUser.FamilyId is not { } familyIdText || !Guid.TryParse(familyIdText, out var familyId))
        {
            return [];
        }

        var cacheKey = $"calendar:{familyId}";
        if (cache.TryGetValue(cacheKey, out IReadOnlyList<CalendarEventDto>? cached) && cached is not null)
        {
            return cached;
        }

        var connection = await db.CalendarConnections.SingleOrDefaultAsync(c => c.FamilyId == familyId, cancellationToken);
        if (connection is null)
        {
            return [];
        }

        var now = timeProvider.GetUtcNow();
        var events = connection.Provider switch
        {
            CalendarConnectionProvider.Google => await FetchGoogleEventsAsync(familyId, now, cancellationToken),
            CalendarConnectionProvider.Ics => await FetchIcsEventsAsync(connection.IcsUrl, now, cancellationToken),
            _ => [],
        };

        cache.Set(cacheKey, events, CacheDuration);
        return events;
    }

    private async Task<IReadOnlyList<CalendarEventDto>> FetchGoogleEventsAsync(
        Guid familyId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var accessToken = await tokenService.GetValidAccessTokenAsync(familyId, cancellationToken);
        if (accessToken is null)
        {
            return [];
        }

        var calendarId = await tokenService.GetCalendarIdAsync(familyId, cancellationToken) ?? "primary";

        var client = httpClientFactory.CreateClient("google-calendar");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var url = $"https://www.googleapis.com/calendar/v3/calendars/{Uri.EscapeDataString(calendarId)}/events" +
                  $"?timeMin={Uri.EscapeDataString(now.ToString("O"))}" +
                  $"&timeMax={Uri.EscapeDataString(now.AddDays(14).ToString("O"))}" +
                  "&singleEvents=true&orderBy=startTime&maxResults=20";

        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return [];
        }

        var payload = await response.Content.ReadFromJsonAsync<GoogleEventsResponse>(cancellationToken: cancellationToken);
        return payload?.Items?.Select(MapGoogleEvent).OfType<CalendarEventDto>().ToList() ?? [];
    }

    private static CalendarEventDto? MapGoogleEvent(GoogleEventItem item)
    {
        var start = item.Start?.DateTime ?? item.Start?.Date;
        var end = item.End?.DateTime ?? item.End?.Date;
        if (item.Id is null || item.Summary is null || start is null || end is null)
        {
            return null;
        }

        if (!DateTimeOffset.TryParse(start, out var startsAt) || !DateTimeOffset.TryParse(end, out var endsAt))
        {
            return null;
        }

        return new CalendarEventDto(item.Id, item.Summary, startsAt, endsAt, item.Location);
    }

    private async Task<IReadOnlyList<CalendarEventDto>> FetchIcsEventsAsync(
        string? icsUrl, DateTimeOffset now, CancellationToken cancellationToken)
    {
        if (icsUrl is null)
        {
            return [];
        }

        var client = httpClientFactory.CreateClient("ics-feed");
        string icsText;
        try
        {
            var response = await client.GetAsync(icsUrl, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return [];
            }

            icsText = await response.Content.ReadAsStringAsync(cancellationToken);
        }
        catch
        {
            return [];
        }

        try
        {
            var calendar = IcsCalendar.Load(icsText);
            var endBound = now.AddDays(14).UtcDateTime;
            var startCalDateTime = new CalDateTime(now.UtcDateTime, hasTime: true);

            // GetOccurrences only takes a start bound (it evaluates RRULEs forward
            // indefinitely) — TakeWhile both bounds the window and stops enumerating
            // early, which matters since an unbounded recurring event would otherwise
            // never terminate. CS8602 suppressed: Ical.Net's nullable annotations on
            // Period/StartTime are broader than what's actually possible here, and this
            // whole block is wrapped in try/catch that fails soft to [] on any exception.
#pragma warning disable CS8602
            var occurrences = calendar.GetOccurrences(startCalDateTime, new EvaluationOptions())
                .TakeWhile(o => o.Period is not null && o.Period.StartTime.AsUtc <= endBound);
#pragma warning restore CS8602

            return occurrences
                .Take(20)
                .Select(MapIcsOccurrence)
                .OfType<CalendarEventDto>()
                .ToList();
        }
        catch
        {
            return []; // malformed feed — fail soft rather than break the dashboard
        }
    }

    private static CalendarEventDto? MapIcsOccurrence(Occurrence occurrence)
    {
        if (occurrence.Source is not CalendarEvent calendarEvent || calendarEvent.Summary is null || occurrence.Period is null)
        {
            return null;
        }

        // EndTime is genuinely null for some events (e.g. all-day events with no
        // explicit DTEND) — EffectiveEndTime falls back to StartTime + duration (or
        // StartTime itself) and is never null.
#pragma warning disable CS8602 // see comment in FetchIcsEventsAsync above
        var start = new DateTimeOffset(DateTime.SpecifyKind(occurrence.Period.StartTime.AsUtc, DateTimeKind.Utc));
        var end = new DateTimeOffset(DateTime.SpecifyKind(occurrence.Period.EffectiveEndTime.AsUtc, DateTimeKind.Utc));
#pragma warning restore CS8602

        // Recurring events share one UID across every instance — suffix with the
        // occurrence's own start time so each instance gets a distinct id (used as a
        // React list key on the frontend; duplicates there would be a real bug).
        var baseId = calendarEvent.Uid ?? Guid.NewGuid().ToString();
        var id = $"{baseId}-{start.UtcTicks}";

        return new CalendarEventDto(id, calendarEvent.Summary, start, end, calendarEvent.Location);
    }
}
