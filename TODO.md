# Backlog (Working Checklist)

## Phase 1: Project Setup & Infrastructure
### 1.1 Monorepo Setup
- [x] Initialize pnpm workspace with packages structure
- [x] Setup shared TypeScript config and ESLint
- [x] Configure Prettier and Husky pre-commit hooks
- [ ] Setup GitHub Actions CI pipeline
- [x] Configure Conventional Commits + commitlint
- [ ] Setup Renovate/Dependabot for dependency updates
- [ ] Create CODEOWNERS + PR rules
- [x] Setup Make/Taskfile for unified commands

### 1.2 Environment & Secrets Management
- [x] Create .env.example with all required variables
- [x] Setup Zod/Joi validation for environment variables
- [ ] Configure secret storage (Doppler/Vault/GitHub Encrypted Secrets)
- [ ] Setup environment-specific configurations (dev/staging/prod)

### 1.3 Docker & Local Development
- [x] Create docker-compose.yml for local services (Postgres, Redis)
- [x] Setup one-command development: `docker-compose up`
- [ ] Configure OpenTelemetry Collector container
- [ ] Setup local observability stack (Tempo/OTEL endpoint)

### 1.4 Backend Foundation (NestJS)
- [x] Initialize NestJS app with TypeScript strict mode
- [x] Setup Prisma with PostgreSQL schema
- [x] Configure environment variables and validation
- [x] Setup OpenTelemetry for observability
- [x] Add health checks and basic API structure
- [x] Setup Sentry for error tracking and alerts

### 1.5 Frontend Foundation (Next.js 15)
- [x] Initialize Next.js 15 app with App Router
- [x] Setup shadcn/ui with Tailwind CSS
- [x] Configure TypeScript and ESLint
- [x] Setup authentication infrastructure
- [x] Create basic layout and navigation
- [ ] Configure Vercel preview deployments
- [ ] Setup Sentry for frontend error tracking

### 1.6 Mobile Foundation (React Native/Expo)
- [x] Initialize Expo app with TypeScript
- [ ] Setup React Navigation
- [x] Configure environment and build settings
- [ ] Setup basic authentication flow
- [ ] Configure Expo EAS preview deployments
- [ ] Setup Crashlytics for mobile error tracking

### 1.7 CI/CD Pipeline
- [x] Setup GitHub Actions CI matrix (lint/typecheck/test/build)
- [x] Configure pnpm caching in CI
- [ ] Setup database migrations in CI on ephemeral DB
- [ ] Configure semantic-release and auto-changelog
- [ ] Setup preview deployments for all platforms

### 1.8 Documentation & Architecture
- [ ] Create comprehensive /docs structure
- [ ] Setup ADR (Architecture Decision Records) process
- [ ] Create architecture diagrams (Excalidraw/PlantUML)
- [ ] Setup API documentation with OpenAPI/Swagger

## Phase 2: Core Domain Models
### 2.1 Database Schema & Data Strategy
- [x] Create Prisma schema for all entities (Terminal, Vessel, Container, Slot, Driver, Truck, Trip, Event)
- [x] Setup UUID/ULID for all IDs
- [x] Add audit fields (createdAt/updatedAt/deletedAt with soft delete)
- [x] Implement timezone strategy (UTC storage, local display)
- [x] Setup database migrations with rollback plans
- [x] Create seed data for development
- [x] Add database indexes and constraints (unique keys, FK cascades)
- [x] Setup PII classification and data retention policies

### 2.2 API Structure & Versioning
- [x] Create NestJS modules for each domain
- [x] Implement CRUD operations for all entities
- [x] Add validation with class-validator
- [x] Setup API versioning (/v1 with /v2 readiness)
- [x] Implement pagination/sorting/filtering standards
- [x] Generate OpenAPI specification
- [ ] Create type-safe SDK with openapi-typescript
- [x] Setup API documentation with Swagger

### 2.3 Authentication & Authorization
- [x] Implement JWT authentication with refresh tokens
- [x] Create RBAC roles (Driver/Dispatcher/Admin)
- [x] Add authorization guards and policy-based access
- [ ] Setup ABAC for carrier/terminal restrictions
- [ ] Implement audit logging for access/actions
- [ ] Add idempotency for critical operations (booking, status updates)

### 2.4 Domain-Specific Requirements
- [ ] Implement container number validation (ISO 6346)
- [ ] Setup reason codes system for analytics
- [ ] Create dual-ops compatibility rules
- [ ] Design demurrage/detention model structure
- [ ] Plan multi-tenancy isolation (tenant_id)
- [ ] Handle slot conflict resolution and deadlocks

## Phase 3: Simulation Engine
### 3.1 Core Simulation & Configuration
- [ ] Implement vessel generation (every 2 days)
- [ ] Create container generation logic
- [ ] Setup slot management system
- [ ] Add delay simulation (hold, not_ready, gate_blocked)
- [ ] Configure terminal settings (capacity per window, closed windows)
- [ ] Setup deterministic simulation with fixed random-seed
- [ ] Implement "time speed" acceleration (x5/x10) for demos
- [ ] Create special rules for empty returns

### 3.2 Advanced Simulation Features
- [ ] Implement incident generator (chassis shortage, gate_blocked, sudden HOLDS)
- [ ] Create reslotting engine with explainable reason codes
- [ ] Setup queues/jobs with BullMQ/Agenda and Redis broker
- [ ] Create demo data seeding scenarios (peak load, night shift, storm)
- [ ] Implement probability-based event generation

### 3.3 Trip Management & Optimization
- [ ] Implement trip creation and assignment
- [ ] Add ETA calculation logic with GPS simulation
- [ ] Create trip status tracking
- [ ] Implement failed arrival detection
- [ ] Setup dual-ops optimization (return empty + pick import)
- [ ] Add real-time trip monitoring and alerts

## Phase 4: UI Development
### 4.1 Dispatcher Console (Next.js 15)
- [ ] Create dashboard layout with responsive design
- [ ] Implement container list with advanced filters and virtualization
- [ ] Add trip management interface with real-time updates
- [ ] Create metrics dashboard with charts and analytics
- [ ] Setup React Query for state management and caching
- [ ] Implement optimistic updates for better UX
- [ ] Add real-time updates (polling with WebSocket flag for future)
- [ ] Setup feature flags for dual-ops and reslotting
- [ ] Implement i18n and accessibility (WCAG AA)
- [ ] Add export functionality (CSV/Excel) for reports

### 4.2 Driver App (React Native/Expo)
- [ ] Create trip list interface with offline support
- [ ] Implement gate pass generation (QR codes with offline rendering)
- [ ] Add trip status tracking with real-time updates
- [ ] Setup push notifications for trip updates
- [ ] Implement secure storage for tokens and sensitive data
- [ ] Configure OTA updates with Expo EAS
- [ ] Setup deep linking (zqp://trip/123)
- [ ] Implement background tasks for GPS/ETA simulation
- [ ] Add offline state management and sync
- [ ] Setup barcode scanning and offline QR generation

## Phase 5: Testing & Polish
### 5.1 Testing Strategy
- [ ] Write unit tests for core domain logic (70% coverage target)
- [ ] Add integration tests for API endpoints with test containers
- [ ] Create E2E tests with Playwright (web) and Detox/maestro (mobile)
- [ ] Setup test coverage reporting with quality gates
- [ ] Implement contract tests with Pact or schemathesis
- [ ] Create test data factories for Vessel/Container/Trip
- [ ] Add load testing with k6/Locust for API endpoints
- [ ] Setup smoke test suite for CI pipeline

### 5.2 Performance & Security
- [ ] Add rate limiting and security headers (Helmet, CORS)
- [ ] Implement caching strategy (Redis, CDN)
- [ ] Optimize database queries and add query monitoring
- [ ] Add performance monitoring and SLO/SLA tracking
- [ ] Setup security scanning (OWASP ASVS compliance)
- [ ] Implement CSRF protection and ID-oriented access control
- [ ] Add dependency vulnerability scanning
- [ ] Setup monitoring dashboards and alerting

### 5.3 Quality Assurance
- [ ] Configure ESLint strict rules and type-coverage thresholds
- [ ] Setup lint-staged for pre-commit quality checks
- [ ] Implement automated code quality gates
- [ ] Add performance budgets and monitoring
- [ ] Setup automated dependency updates and security audits

### 5.4 Release Process
- [ ] Configure semantic-release for automated versioning
- [ ] Setup auto-changelog generation
- [ ] Create release notes templates
- [ ] Implement staged rollouts and feature flags
- [ ] Setup production monitoring and rollback procedures

## Current Sprint: Monorepo Setup
- [x] Initialize pnpm workspace with packages structure
- [x] Setup shared TypeScript config and ESLint
- [x] Configure Prettier and Husky pre-commit hooks
- [x] Create .env.example with all required variables
- [x] Setup Zod validation for environment variables
- [x] Create docker-compose.yml for local services
- [x] Setup Make/Taskfile for unified commands
- [x] Configure Conventional Commits + commitlint
- [x] Create comprehensive .gitignore
- [x] Create README.md with setup instructions

## Current Sprint: Backend Foundation (NestJS)
- [x] Initialize NestJS app with TypeScript strict mode
- [x] Setup Prisma with PostgreSQL schema
- [x] Configure environment variables and validation
- [x] Setup OpenTelemetry for observability
- [x] Add health checks and basic API structure
- [x] Setup Sentry for error tracking and alerts

## Current Sprint: Database Schema & Core Domain Models
- [x] Setup Supabase configuration and connection strings
- [x] Create Supabase service and module
- [x] Setup Next.js frontend with Supabase integration
- [x] Setup Expo mobile app with Supabase integration
- [x] Create initial Prisma migration (SQL file for manual execution)
- [x] Setup database seeding with test data
- [x] Create core domain services (Terminal, Vessel, Container, Driver, Trip, Slot)
- [x] Implement CRUD operations with validation
- [x] Add API endpoints with Swagger documentation
- [x] Setup error handling and logging
- [x] Create database migration tools and instructions
- [ ] Execute SQL migration in Supabase Dashboard
- [ ] Test API endpoints with seed data