# DriverOS Platform Setup Guide

## Overview

DriverOS использует Supabase как единую базу данных для всех платформ:
- **Backend**: NestJS с Prisma ORM
- **Frontend**: Next.js 15 с App Router
- **Mobile**: React Native с Expo

## Environment Configuration

### Backend (.env)
```bash
# Database (Backend)
DATABASE_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL=https://cubaxcawnlhvtipdktim.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=cubaxcawnlhtvipdktim
```

### Next.js Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://cubaxcawnlhvtipdktim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4
```

### Expo Mobile (.env)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://cubaxcawnlhvtipdktim.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key-here
```

## Connection Types

### 1. Session Pooler (Production)
```
postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```
- **Использование**: Долгоживущие соединения
- **Порт**: 5432

### 2. Transaction Pooler (High Load)
```
postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres
```
- **Использование**: Короткие транзакции
- **Порт**: 6543

### 3. Direct Connection (Migrations)
```
postgresql://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres
```
- **Использование**: Prisma миграции
- **Порт**: 5432

## Setup Instructions

### 1. Backend Setup
```bash
cd packages/backend

# Install dependencies
pnpm install

# Create .env file
cp ../../env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate:dev

# Start development server
pnpm start:dev
```

### 2. Frontend Setup
```bash
cd packages/frontend

# Install dependencies
pnpm install

# Create .env.local file
cp ../../env.example .env.local

# Start development server
pnpm dev
```

### 3. Mobile Setup
```bash
cd packages/mobile

# Install dependencies
pnpm install

# Create .env file
cp ../../env.example .env

# Start Expo development server
pnpm start
```

## Development Workflow

### 1. Database Changes
```bash
# 1. Update Prisma schema
cd packages/backend
# Edit prisma/schema.prisma

# 2. Create migration
pnpm db:migrate:dev

# 3. Apply to Supabase
pnpm db:migrate

# 4. Generate types
pnpm db:generate
```

### 2. API Development
```bash
# 1. Create service
cd packages/backend/src
# Create new service file

# 2. Add to module
# Update module imports

# 3. Test endpoint
curl http://localhost:3000/api/v1/health
```

### 3. Frontend Development
```bash
# 1. Create component
cd packages/frontend/src
# Create new component

# 2. Add to page
# Update page.tsx

# 3. Test in browser
# Open http://localhost:3001
```

### 4. Mobile Development
```bash
# 1. Create screen
cd packages/mobile/src
# Create new screen

# 2. Add to navigation
# Update app router

# 3. Test on device
# Use Expo Go app
```

## Key Features

### Backend (NestJS)
- ✅ Prisma ORM с Supabase
- ✅ OpenTelemetry для наблюдаемости
- ✅ Sentry для отслеживания ошибок
- ✅ JWT аутентификация
- ✅ Rate limiting
- ✅ Swagger документация

### Frontend (Next.js 15)
- ✅ App Router
- ✅ Supabase SSR интеграция
- ✅ React Query для кеширования
- ✅ Tailwind CSS + shadcn/ui
- ✅ TypeScript строгий режим

### Mobile (Expo)
- ✅ Expo Router
- ✅ Supabase с SecureStore
- ✅ React Navigation
- ✅ React Native Paper UI
- ✅ QR код сканирование

## Security Considerations

1. **API Keys**: Никогда не коммитьте реальные ключи
2. **Environment Variables**: Используйте .env файлы
3. **Row Level Security**: Включите RLS в Supabase
4. **CORS**: Настройте правильно для production
5. **Rate Limiting**: Используйте для защиты API

## Monitoring

### Supabase Dashboard
- URL: https://supabase.com/dashboard/project/cubaxcawnlhtvipdktim
- Database metrics
- API usage
- Error tracking

### Application Monitoring
- Backend: Sentry + OpenTelemetry
- Frontend: Sentry
- Mobile: Expo Analytics + Sentry

## Deployment

### Backend
```bash
# Build for production
cd packages/backend
pnpm build

# Deploy to your platform
# (Vercel, Railway, etc.)
```

### Frontend
```bash
# Build for production
cd packages/frontend
pnpm build

# Deploy to Vercel
vercel --prod
```

### Mobile
```bash
# Build for production
cd packages/mobile
pnpm build:android
pnpm build:ios

# Submit to stores
pnpm submit:android
pnpm submit:ios
```

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Проверьте connection strings
   - Убедитесь, что IP не заблокирован

2. **Authentication**
   - Проверьте API ключи
   - Убедитесь, что RLS настроен правильно

3. **Build Errors**
   - Очистите кеш: `pnpm clean`
   - Переустановите зависимости: `rm -rf node_modules && pnpm install`

### Support
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Expo Docs: https://docs.expo.dev
- NestJS Docs: https://docs.nestjs.com
