# 🔧 Environment Variables Setup Guide

## 📅 Дата: 17 августа 2025

### 🎯 **Ключи Supabase**

Из вашего изображения у нас есть два ключа:

#### **1. CURRENT KEY (Legacy HS256)**
- **KEY ID**: `ed46aa98-675c-4bbc-8294-1bd89f8151a4`
- **TYPE**: Legacy HS256 (Shared Secret)
- **Использование**: JWT_SECRET (основной токен доступа)

#### **2. STANDBY KEY (ECC P-256)**
- **KEY ID**: `f1858560-de09-47cc-b898-65e480c7e6f6`
- **TYPE**: ECC (P-256)
- **Использование**: JWT_REFRESH_SECRET (токен обновления)

### 🔧 **Backend (.env)**

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres"

# JWT Authentication
JWT_SECRET=ed46aa98-675c-4bbc-8294-1bd89f8151a4
JWT_REFRESH_SECRET=f1858560-de09-47cc-b898-65e480c7e6f6
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://cubaxcawnlhvtipdktim.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

### 🌐 **Frontend (.env)**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase (для прямого доступа к базе данных)
NEXT_PUBLIC_SUPABASE_URL=https://cubaxcawnlhvtipdktim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4
```

### 🔐 **Объяснение ключей**

#### **JWT_SECRET (CURRENT KEY)**
- **Тип**: Legacy HS256 (Shared Secret)
- **Назначение**: Подпись JWT токенов доступа
- **Алгоритм**: HMAC-SHA256
- **Срок действия**: 15 минут

#### **JWT_REFRESH_SECRET (STANDBY KEY)**
- **Тип**: ECC P-256 (Elliptic Curve)
- **Назначение**: Подпись refresh токенов
- **Алгоритм**: ECDSA с P-256 кривой
- **Срок действия**: 7 дней

### 🚀 **Запуск приложения**

#### **1. Backend (порт 3001)**
```bash
cd packages/backend
pnpm dev
```

#### **2. Frontend (порт 3002)**
```bash
cd packages/frontend
pnpm dev
```

### 🔍 **Проверка работы**

#### **Backend Health Check**
```bash
curl http://localhost:3001/health
```

#### **Frontend**
- Откройте: http://localhost:3002
- Попробуйте зарегистрироваться
- Проверьте вход в систему

### ⚠️ **Важные замечания**

1. **Безопасность**: Никогда не коммитьте .env файлы в git
2. **Порты**: Backend на 3001, Frontend на 3002
3. **CORS**: Настроен для localhost:3000 и localhost:3002
4. **Database**: Используется Supabase PostgreSQL

### 🔗 **Полезные ссылки**

- **Supabase Dashboard**: https://supabase.com/dashboard/project/cubaxcawnlhvtipdktim
- **JWT.io**: https://jwt.io/ (для тестирования токенов)
- **NestJS Docs**: https://docs.nestjs.com/security/authentication

**Статус**: Переменные окружения настроены! 🎯
