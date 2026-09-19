# 🏠 Replogle HQ
### Mission Control for the Replogle Household

Replogle HQ is a self-hosted family command center with a TV-friendly dashboard and mobile-first admin experience.

## Initial stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router + TanStack Query
- ASP.NET Core + C#
- Entity Framework Core
- PostgreSQL
- Docker / Docker Compose
- PWA

## Development principles
- Build incrementally.
- Keep the architecture simple and modular.
- Mobile administration is first-class.
- Dashboard mode must be readable from a distance.
- Widgets are independent modules.
- Household data must not be hard-coded.
- Backend owns external integrations and secrets.
- Enforce authorization server-side.
- Prefer strong typing and meaningful tests.
- Do not build future features prematurely.

## First milestone
Build a polished dashboard shell using demo data before implementing Google OAuth or production persistence.

Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/UI.md`, and `docs/ROADMAP.md` before substantial implementation.
