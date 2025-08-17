# Supabase Migration Instructions

## Выполнение SQL миграции в Supabase Dashboard

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Войдите в свой аккаунт
3. Выберите проект: `cubaxcawnlhtvipdktim`

### Шаг 2: Откройте SQL Editor
1. В левом меню найдите "SQL Editor"
2. Нажмите "New query" для создания нового запроса

### Шаг 3: Выполните миграцию
1. Скопируйте весь SQL код из файла `packages/backend/prisma/migration.sql`
2. Вставьте код в SQL Editor
3. Нажмите "Run" для выполнения

### Шаг 4: Проверьте результат
После выполнения миграции вы должны увидеть:
- 17 ENUM типов создано
- 18 таблиц создано
- Уникальные индексы созданы
- Внешние ключи созданы
- RLS политики настроены

### Шаг 5: Проверьте таблицы
В левом меню перейдите в "Table Editor" и убедитесь, что все таблицы созданы:
- terminals
- terminal_settings
- vessels
- vessel_schedules
- containers
- container_holds
- slots
- drivers
- driver_availability
- driver_metrics
- trucks
- truck_locations
- trips
- slot_bookings
- trip_metrics
- trip_events
- events
- system_alerts

## Альтернативный способ через CLI

Если у вас есть доступ к Supabase CLI, можно выполнить:

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в аккаунт
supabase login

# Свяжите проект
supabase link --project-ref cubaxcawnlhtvipdktim

# Выполните миграцию
supabase db push
```

## Проверка подключения

После миграции можно проверить подключение:

```bash
cd packages/backend
export DATABASE_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgres://postgres:Gariba1ddi@db.cubaxcawnlhvtipdktim.supabase.co:5432/postgres"
npx prisma db pull
```

## Следующие шаги

После успешной миграции:
1. Запустите seeding данных: `npx prisma db seed`
2. Протестируйте API endpoints
3. Начните разработку фронтенда

## Troubleshooting

### Ошибка аутентификации
Если получаете ошибку аутентификации, проверьте:
- Правильность пароля в connection string
- Доступ к базе данных (не заблокирована ли)
- Настройки RLS политик

### Ошибка дублирования
Если получаете ошибку о существующих объектах:
- Удалите существующие таблицы через SQL Editor
- Выполните миграцию заново

### Ошибка прав доступа
Убедитесь, что у вас есть права на создание таблиц в базе данных.
