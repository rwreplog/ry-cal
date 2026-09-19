# Data Model

## Core entities
- Family
- FamilyMember
- User
- Chore
- ChoreCompletion
- Dashboard
- DashboardWidget
- Announcement
- CalendarConnection

## Rules
- Household-owned records are scoped to a Family.
- A user must never access another family's records.
- Use EF Core migrations.
- Keep the initial schema simple.
- Sensitive integration tokens never go to the frontend.

## ChoreCompletion
Preserve historical completion records with chore ID, family member ID, and completion timestamp.
