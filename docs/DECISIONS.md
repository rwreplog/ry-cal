# Architecture Decisions

## ADR-001 — Widget-based dashboard
The dashboard is built around independent widget definitions so new household features can be added without rewriting the dashboard.

## ADR-002 — Demo dashboard before integrations
The first visible milestone is a polished dashboard with demo data. Google OAuth, production persistence, and external integrations come later.

## ADR-003 — Backend owns integrations
External API credentials and token handling remain server-side.
