.PHONY: help dev build test lint clean docker-up docker-down db-migrate db-seed install

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
dev: ## Start all services in development mode
	@echo "🚀 Starting DriverOS development environment..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	pnpm install
	pnpm dev

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	pnpm install

build: ## Build all packages
	@echo "🔨 Building all packages..."
	pnpm build

test: ## Run all tests
	@echo "🧪 Running tests..."
	pnpm test

lint: ## Run linting
	@echo "🔍 Running linter..."
	pnpm lint

typecheck: ## Run TypeScript type checking
	@echo "🔍 Running type checking..."
	pnpm typecheck

clean: ## Clean all build artifacts
	@echo "🧹 Cleaning build artifacts..."
	pnpm clean
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf packages/*/dist
	rm -rf packages/*/.next

# Docker commands
docker-up: ## Start Docker services
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🐳 Stopping Docker services..."
	docker-compose down

docker-logs: ## Show Docker logs
	@echo "📋 Showing Docker logs..."
	docker-compose logs -f

# Database commands
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	pnpm db:migrate

db-seed: ## Seed database with test data
	@echo "🌱 Seeding database..."
	pnpm db:seed

db-reset: ## Reset database (drop and recreate)
	@echo "🔄 Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	@sleep 5
	pnpm db:migrate
	pnpm db:seed

# Setup commands
setup: ## Initial project setup
	@echo "⚙️ Setting up DriverOS project..."
	@echo "1. Installing dependencies..."
	pnpm install
	@echo "2. Starting Docker services..."
	docker-compose up -d
	@echo "3. Waiting for services..."
	@sleep 10
	@echo "4. Running database migrations..."
	pnpm db:migrate
	@echo "5. Seeding database..."
	pnpm db:seed
	@echo "✅ Setup complete! Run 'make dev' to start development."

# Utility commands
logs: ## Show application logs
	@echo "📋 Showing application logs..."
	pnpm --filter backend run logs

format: ## Format code with Prettier
	@echo "🎨 Formatting code..."
	pnpm --recursive run format

check: ## Run all checks (lint, typecheck, test)
	@echo "🔍 Running all checks..."
	pnpm lint
	pnpm typecheck
	pnpm test

# Production commands
prod-build: ## Build for production
	@echo "🏭 Building for production..."
	NODE_ENV=production pnpm build

prod-start: ## Start production services
	@echo "🚀 Starting production services..."
	docker-compose -f docker-compose.prod.yml up -d

# Monitoring
monitor: ## Open monitoring dashboards
	@echo "📊 Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3001 (admin/admin)"
	@echo "Jaeger: http://localhost:16686"
	@echo "Prometheus: http://localhost:9090"
	open http://localhost:3001 || true
	open http://localhost:16686 || true
	open http://localhost:9090 || true
