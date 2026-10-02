# 🏠 Replogle HQ
## Mission Control for the Replogle Household

A self-hosted family dashboard: a TV/wall-display view of what's going on with the household, and a mobile-friendly admin area to manage it. React + TypeScript on the frontend, ASP.NET Core + PostgreSQL on the backend, running in Docker.

### Features
- **Calendar** — syncs from Google Calendar or a public ICS/webcal feed (e.g. an iCloud shared calendar), shown as a Sunday–Saturday week or a rolling next-7-days view
- **Chores** — assignment, recurrence, due dates, completion history, and touch-friendly checkboxes for a kiosk display
- **Weather** — current conditions and today's high/low via Open-Meteo (no API key required)
- **Announcements, meal planning, shopping list, countdowns** — the rest of the day-to-day household info
- **Themes** — Modern, Dark, Cozy, and an automatic seasonal/holiday mode (a different palette each month, with a one-day animated flourish on Valentine's, St. Patrick's, Easter, July 4th, Halloween, Thanksgiving, and Christmas) — previewable from Dashboard Settings without waiting for the date
- **Dashboard layouts** — the default stacked layout, or a sidebar layout for wide landscape screens where the calendar fills a tall right pane and everything else stacks in a left rail
- **TV mode** — fullscreen kiosk display with automatic night dimming
- **PWA** — installable, works as a home-screen app

See `CLAUDE.md` and `docs/` for project guidance and architecture decisions.

## Local development

Requires: [.NET 10 SDK](https://dotnet.microsoft.com/download), [Node.js 22+](https://nodejs.org), Docker (for Postgres).

```bash
cp .env.example .env

# Postgres
docker compose up postgres

# Backend API — http://localhost:5080
cd src/backend
dotnet tool restore
dotnet run --project src/FamilyDashboard.Api

# Frontend — http://localhost:5173 (in another terminal)
cd src/frontend
npm install
npm run dev
```

Run tests:

```bash
# Backend
cd src/backend && dotnet test

# Frontend
cd src/frontend && npm run test
```

Apply database migrations (once Postgres is running):

```bash
cd src/backend
dotnet tool run dotnet-ef database update \
  --project src/FamilyDashboard.Infrastructure \
  --startup-project src/FamilyDashboard.Api
```

Run the full stack in containers:

```bash
docker compose up --build
```
