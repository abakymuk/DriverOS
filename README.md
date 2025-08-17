# DriverOS 🚛

**DriverOS** - это система управления логистикой контейнерных перевозок, которая симулирует работу терминалов, водителей и диспетчеров для оптимизации процессов доставки контейнеров.

## 🎯 Цель проекта

Создать минимально работающий продукт, который:
- позволяет **водителям** бронировать слоты и получать «виртуальный пропуск»
- даёт **диспетчерам** управление флотом и контроль статусов
- симулирует **терминалы** и контейнеры (генерация, задержки, слоты)
- собирает **метрики эффективности**

## 🏗️ Архитектура

```
┌───────────────────────────────────────────────────┐
│                    USERS                          │
├───────────────────────────┬───────────────────────┤
│  Dispatcher (Web)         │   Driver (Mobile)     │
│  Next.js 15 + shadcn/ui   │   React Native/Expo   │
└─────────────┬─────────────┴───────────┬───────────┘
              │                         │
      HTTPS/JSON API                   HTTPS/JSON API
              │                         │
              ▼                         ▼
  ┌────────────────────────────────────────────────────────┐
  │                     BACKEND (NestJS)                   │
  │      API Layer        │     Domain Services            │
  │  (Controllers/DTO)    │  (Trips/Slots/Containers)      │
  └─────────────┬─────────┴───────────┬────────────────────┘
                │                     │
                ▼                     ▼
      ┌─────────────────┐     ┌────────────────────────┐
      │ SIMULATION JOBS │     │  METRICS AGGREGATOR    │
      │ (Cron/Workers)  │     │ (turn, dwell, hit-rate)│
      └───────┬─────────┘     └───────────┬────────────┘
              │                           │
              ▼                           ▼
   ┌───────────────────────┐     ┌──────────────────────────┐
   │   POSTGRES (Prisma)   │     │        CACHE (Redis)     │
   │  ───────────────────  │     │                          │
   │  Tables:              │     │                          │
   │  - terminals          │     │                          │
   │  - vessels            │     │                          │
   │  - containers         │     │                          │
   │  - slots              │     │                          │
   │  - drivers, trucks    │     │                          │
   │  - trips              │     │                          │
   │  - events             │     │                          │
   │  - metrics_*          │     │                          │
   └───────────┬───────────┘     └──────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────────────┐
│           INTEGRATION BOUNDARY (futures)                           │
│  eModal Appointments | Port Optimizer (LA/LB) | GPS/Telematics     │
└────────────────────────────────────────────────────────────────────┘
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose
- Git

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd DriverOS
   ```

2. **Настройте переменные окружения**
   ```bash
   cp env.example .env
   # Отредактируйте .env файл под ваши нужды
   ```

3. **Запустите полную установку**
   ```bash
   make setup
   ```

4. **Запустите разработку**
   ```bash
   make dev
   ```

### Доступные команды

```bash
# Разработка
make dev              # Запуск всех сервисов в режиме разработки
make install          # Установка зависимостей
make build            # Сборка всех пакетов
make test             # Запуск тестов
make lint             # Проверка кода
make typecheck        # Проверка типов TypeScript

# Docker
make docker-up        # Запуск Docker сервисов
make docker-down      # Остановка Docker сервисов
make docker-logs      # Просмотр логов Docker

# База данных
make db-migrate       # Запуск миграций
make db-seed          # Заполнение тестовыми данными
make db-reset         # Сброс базы данных

# Утилиты
make clean            # Очистка артефактов сборки
make format           # Форматирование кода
make check            # Запуск всех проверок
make monitor          # Открытие дашбордов мониторинга
```

## 📦 Структура проекта

```
DriverOS/
├── packages/
│   ├── backend/          # NestJS API сервер
│   ├── frontend/         # Next.js 15 веб-приложение
│   ├── mobile/           # React Native/Expo приложение
│   ├── shared/           # Общие утилиты и компоненты
│   ├── config/           # Общие конфигурации
│   └── types/            # TypeScript типы
├── tools/                # Инструменты разработки
├── docs/                 # Документация
├── config/               # Конфигурации Docker и мониторинга
└── scripts/              # Скрипты автоматизации
```

## 🔧 Технологический стек

### Backend
- **NestJS** - фреймворк для Node.js
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и очереди
- **JWT** - аутентификация
- **OpenTelemetry** - наблюдаемость

### Frontend
- **Next.js 15** - React фреймворк
- **shadcn/ui** - компоненты UI
- **Tailwind CSS** - стилизация
- **TypeScript** - типизация
- **React Query** - управление состоянием

### Mobile
- **React Native** - мобильная разработка
- **Expo** - инструменты разработки
- **React Navigation** - навигация
- **TypeScript** - типизация

### DevOps
- **Docker** - контейнеризация
- **pnpm** - менеджер пакетов
- **Husky** - Git хуки
- **commitlint** - проверка коммитов
- **GitHub Actions** - CI/CD

## 📊 Мониторинг

После запуска доступны следующие дашборды:

- **Grafana**: http://localhost:3001 (admin/admin)
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

## 🧪 Тестирование

```bash
# Запуск всех тестов
make test

# Запуск тестов с покрытием
pnpm test:coverage

# E2E тесты
pnpm test:e2e
```

## 📝 Коммиты

Проект использует [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(backend): add container booking endpoint
fix(frontend): resolve slot selection issue
docs: update API documentation
style: format code with prettier
refactor(shared): extract common validation logic
test(backend): add unit tests for trip service
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Внесите изменения и закоммитьте (`git commit -m 'feat: add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [документацию](docs/)
2. Создайте [Issue](https://github.com/your-org/driveros/issues)
3. Обратитесь к команде разработки

---

**DriverOS** - Оптимизация логистики контейнерных перевозок 🚛✨
