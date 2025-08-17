# Testing Strategy

## Pyramid
- Unit (70%) — fast, isolated
- Integration (20%) — modules/services + DB (test container)
- E2E (10%) — Playwright critical paths

## Tooling
- Unit: Vitest/Jest
- E2E: Playwright
- Coverage: `pnpm test:coverage` (target ≥ 80%)

## CI Gates
- Lint, Typecheck, Unit, Integration, E2E smoke
- Block merge if coverage falls

## Writing Tests
- Given/When/Then naming
- One assertion cluster per scenario
- Mock only pure I/O boundaries

## Test Data
- Factories/builders, seed scripts for E2E