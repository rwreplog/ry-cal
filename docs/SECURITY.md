# Security

- Administrative functionality requires authentication.
- Authorization is enforced by the backend.
- Every protected endpoint verifies authentication, family membership, and role where applicable.
- Google OAuth secrets and tokens remain server-side.
- Never commit secrets.
- Production requires HTTPS.
- Use EF Core parameterization.
- Do not log passwords or OAuth tokens.
- Treat calendar information and household routines as private.
