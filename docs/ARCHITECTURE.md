# Architecture

## High-level
Browser / TV
→ React PWA
→ ASP.NET Core API
→ PostgreSQL

The API owns external integrations such as Google Calendar and weather providers.

## Frontend
Suggested structure:
- app/
- components/
- features/dashboard/
- features/chores/
- features/calendar/
- features/family/
- features/themes/
- services/
- hooks/
- types/

## Backend
Suggested structure:
- FamilyDashboard.Api
- FamilyDashboard.Application
- FamilyDashboard.Domain
- FamilyDashboard.Infrastructure

## Widget architecture
Use a registry rather than coupling the dashboard to individual widgets.

Conceptually:
```ts
interface DashboardWidgetDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  component: React.ComponentType;
  settingsComponent?: React.ComponentType;
}
```

Stored dashboard configuration determines widget visibility, order, position, size, and configuration.

## External integrations
Use provider interfaces. The frontend receives normalized application data and never handles provider credentials.

## Deployment
The application should remain deployable with a small number of containers and avoid unnecessary cloud-specific infrastructure.
