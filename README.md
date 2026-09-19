# 🏠 Replogle HQ
## Mission Control for the Replogle Household

A self-hosted family dashboard for calendars, chores, weather, announcements, and whatever else belongs on the family's command center.

### Initial goal
Create a beautiful responsive dashboard using demo data first. Then progressively replace demo services with the real API, database, authentication, and integrations.

See `CLAUDE.md` and `docs/` for project guidance.

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
