# Technical Specification

## 1. Architecture
- UI (Next.js) → API (Nest) → DB (PostgreSQL via Prisma)
- Messaging (future): BullMQ / Redis
- Observability: logs, metrics, traces (OTel)

## 2. Domain Overview
- Core Entities: <Entity A>, <Entity B>
- Invariants: bullet rules here

## 3. API
- REST (JSON). Auth: JWT (access/refresh)
- Example:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/items?limit=20&cursor=…`

## 4. Data
- Postgres schema in `/prisma/schema.prisma`
- Migrations via `prisma migrate`
- Soft deletes? (Y/N) — decide & ADR it

## 5. Non-Functionals
- Perf SLO: p95 API < 300ms for common endpoints
- Security: OWASP ASVS baseline
- Reliability: SLO 99.9% (core APIs)

## 6. Risks
- List known risks + mitigation

## 7. Open Questions
- Track here; resolve via ADRs