# Supabase Setup for DriverOS Backend

## Overview

DriverOS использует Supabase как основную базу данных и сервис аутентификации. Настроены различные типы подключений для разных сценариев использования.

## Connection Strings

### 1. Session Pooler (Рекомендуется для production)
```
postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```
- **Использование**: Основное приложение, долгоживущие соединения
- **Преимущества**: Лучшая производительность для долгих сессий
- **Порт**: 5432

### 2. Transaction Pooler (Для высоконагруженных приложений)
```
postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres
```
- **Использование**: Высоконагруженные API, короткие транзакции
- **Преимущества**: Быстрые соединения, автоматическое управление пулом
- **Порт**: 6543

### 3. Direct Connection (Для миграций и администрирования)
```
postgresql://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres
```
- **Использование**: Prisma миграции, прямые запросы
- **Преимущества**: Полный доступ к базе данных
- **Порт**: 5432

## Environment Variables

Добавьте следующие переменные в ваш `.env` файл:

```bash
# Supabase Configuration
SUPABASE_URL=https://cubaxcawnlhtvipdktim.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1YmF4Y2F3bmxodnRpcGRrdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTQyNjEsImV4cCI6MjA3MTAzMDI2MX0.KPTdHStVDYksE7yBQmnr3Dd9a_xNNGtEYIMtUj45NV4
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=cubaxcawnlhtvipdktim

# Database URLs
DATABASE_URL="postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
DATABASE_URL_TEST="postgresql://postgres.cubaxcawnlhvtipdktim:Gariba1ddi@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

## Setup Steps

### 1. Установка зависимостей
```bash
pnpm add @supabase/supabase-js
```

### 2. Генерация типов базы данных
```bash
# Установите Supabase CLI
npm install -g supabase

# Генерируйте типы из вашей схемы
supabase gen types typescript --project-id cubaxcawnlhtvipdktim > src/supabase/database.types.ts
```

### 3. Настройка Prisma
```bash
# Создайте миграцию
pnpm db:migrate:dev

# Примените миграции к Supabase
pnpm db:migrate
```

### 4. Сидинг данных
```bash
# Заполните базу тестовыми данными
pnpm db:seed
```

## Usage in Code

### Supabase Service
```typescript
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class SomeService {
  constructor(private supabaseService: SupabaseService) {}

  async getTerminals() {
    return this.supabaseService.getTerminals();
  }

  async subscribeToChanges() {
    return this.supabaseService.subscribeToTerminals((payload) => {
      console.log('Terminal changed:', payload);
    });
  }
}
```

### Real-time Subscriptions
```typescript
// Подписка на изменения терминалов
const subscription = this.supabaseService.subscribeToTerminals((payload) => {
  if (payload.eventType === 'INSERT') {
    console.log('New terminal:', payload.new);
  }
});

// Отписка
subscription.unsubscribe();
```

## Security Considerations

1. **Service Role Key**: Используйте только в backend, никогда не экспонируйте в frontend
2. **Row Level Security (RLS)**: Включите RLS для всех таблиц
3. **API Keys**: Храните ключи в безопасных переменных окружения
4. **Connection Pooling**: Используйте session pooler для production

## Monitoring

### Supabase Dashboard
- URL: https://supabase.com/dashboard/project/cubaxcawnlhtvipdktim
- Мониторинг запросов, производительности, ошибок

### Database Metrics
- Connection pool usage
- Query performance
- Error rates
- Storage usage

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Проверьте правильность connection string
   - Убедитесь, что IP не заблокирован

2. **Authentication Errors**
   - Проверьте правильность API ключей
   - Убедитесь, что ключи не истекли

3. **Performance Issues**
   - Используйте connection pooling
   - Оптимизируйте запросы
   - Мониторьте использование ресурсов

### Support
- Supabase Documentation: https://supabase.com/docs
- Community Forum: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com
