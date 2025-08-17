# Security Policy

## Secrets
- Store in env/vault; never commit.
- Rotate keys on schedule or incident.

## Dependencies
- Weekly audit (`pnpm audit`, Snyk/Dependabot).
- Update vulnerable packages promptly.

## App Security
- Input validation at boundaries
- Auth: short-lived access tokens, refresh rotation
- Rate limiting & IP throttling for sensitive endpoints
- TLS everywhere; HSTS on edge

## Reporting
- security@<yourdomain> for disclosures