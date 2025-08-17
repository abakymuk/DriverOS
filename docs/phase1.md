# Phase 1 — Simulation MVP (12 Weeks Roadmap)

## 🎯 Goal
Создать минимально работающий продукт, который:
- позволяет **водителям** бронировать слоты и получать «виртуальный пропуск»;
- даёт **диспетчерам** управление флотом и контроль статусов;
- симулирует **терминалы** и контейнеры (генерация, задержки, слоты);
- собирает **метрики эффективности**.

---

## 🔑 Core Modules

### 1) Backend (Simulation Engine + API)
- База данных (PostgreSQL).
- Модели: `Vessel`, `Container`, `Slot`, `Truck`, `Driver`, `Trip`, `Terminal`, `Event`.
- Генератор событий: прибытие судов, появление доступных контейнеров.
- Имитация задержек: `hold`, `not_ready`, `gate_blocked`, `chassis_shortage`.
- API для фронтенда:
  - `GET /containers` → список доступных контейнеров.
  - `GET /slots?terminalId=&date=` → доступные слоты.
  - `POST /book-slot` → бронирование слота.
  - `POST /trips/:id/start` → начать рейс (фиксируем ETA).
  - `GET /trip-status/:id` → статус рейса.
  - `GET /metrics/overview` → агрегированные метрики.

### 2) Dispatcher Console (Web, Next.js)
- Авторизация диспетчера.
- Дашборд: список водителей, контейнеры, активные рейсы.
- Таблица контейнеров: статус, `ready_at`, терминал, слот.
- Назначение контейнера водителю, переслотирование.
- Отчёты: рейсы, failed arrivals, средний turn time, dwell.

### 3) Driver App (Mobile, React Native/Expo)
- Авторизация водителя.
- Список назначенных рейсов.
- Карточка контейнера: терминал, слот, статус, ETA.
- Кнопка «Start trip» (имитация GPS).
- Экран «Gate Pass» (QR/код).
- Push-уведомления: «Контейнер не готов, слот перенесён».

### 4) Simulation Rules
- Каждые 2 дня создаётся виртуальное судно (300–500 контейнеров).
- У контейнера: `ready_at`, `hold` (≈10%), `line`, `terminal_id`.
- Слоты терминала ограничены (напр., 200/день, окна по 1 часу).
- Приезд до `ready_at` → `failed arrival`.
- Успешные рейсы уменьшают dwell time.
- Dual-транзакции: возврат пустого + забор импорта в одном рейсе.

### 5) Metrics Dashboard
- Средний **turn time** (имитация: 40–70 мин).
- **Failed arrivals** (% от всех назначений).
- **Hit rate** по слотам.
- Средний **dwell time** (по когорте судна/терминала).
- Реализация: модуль сбора статистики на Backend + отображение в консоли.

---

## 🗺 ASCII-схема архитектуры Phase 1

```ascii
                       ┌───────────────────────────────────────────────────┐
                       │                    USERS                          │
                       ├───────────────────────────┬───────────────────────┤
                       │  Dispatcher (Web)         │   Driver (Mobile)     │
                       │  Next.js + shadcn/ui      │   React Native (Expo) │
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
                                 │                     │
                                 ▼                     ▼
                       ┌─────────────────┐     ┌────────────────────────┐
                       │ SIMULATION JOBS │     │  METRICS AGGREGATOR    │
                       │ (Cron/Workers)  │     │ (turn, dwell, hit-rate)│
                       └───────┬─────────┘     └───────────┬────────────┘
                               │                           │
                               │ Events (Vessel, Delays)   │ Periodic rollups
                               │                           │
                               ▼                           ▼
                    ┌───────────────────────┐     ┌──────────────────────────┐
                    │   POSTGRES (Prisma)   │     │        CACHE (opt.)       │
                    │  ───────────────────  │     │ Redis for hot counters    │
                    │  Tables:              │     └──────────────────────────┘
                    │  - terminals          │
                    │  - vessels            │
                    │  - containers         │
                    │  - slots              │
                    │  - drivers, trucks    │
                    │  - trips              │
                    │  - events             │
                    │  - metrics_*          │
                    └───────────┬───────────┘
                                │
                                │ (Phase 2/3 — внешние источники данных)
                                ▼
         ┌────────────────────────────────────────────────────────────────────┐
         │           INTEGRATION BOUNDARY (futures)                           │
         │  eModal Appointments | Port Optimizer (LA/LB) | GPS/Telematics     │
         └────────────────────────────────────────────────────────────────────┘


⸻

🔁 Типовой поток данных (Sequence)

[Dispatcher] assigns container → [Backend/API] creates TRIP
   → [Driver] sees trip in app → presses "Start trip"
   → [Backend] computes ETA (simulated GPS) → checks SLOT readiness
   → [Simulation Jobs] may flip container to READY or add HOLD
   → If READY within slot: trip.status = GATE_READY; driver gets QR
   → Driver "Arrive at gate" → Backend simulates processing time (turn)
   → Trip = COMPLETED → Metrics updated (turn, hit-rate, dwell)
   → Dispatcher dashboard updates in realtime (polling/WS*)

*WS можно добавить позднее; на Phase 1 достаточно polling/long-poll.

⸻

📍 Timeline (12 Weeks)

Weeks 1–2 — Setup
	•	Монорепо (pnpm workspaces).
	•	NestJS + Prisma + Supabase.
	•	Схемы БД: Container, Slot, Driver, Trip, Terminal, Event.
	•	Next.js заготовка (auth, layout).

Weeks 3–4 — Simulation Core
	•	Генератор судов/контейнеров/терминалов.
	•	API: /containers, /slots, /book-slot.
	•	Имитация задержек и hold.
	•	Первая версия Dispatcher Console (список контейнеров + назначение).

Weeks 5–6 — Driver App
	•	Список рейсов.
	•	Экран «Gate Pass» (QR/код).
	•	Имитация GPS/ETA (рандомизация).
	•	Локальные push-уведомления.

Weeks 7–8 — Queue & Trips
	•	Имитация очередей/turn time.
	•	Логика failed arrivals / reslot.
	•	Отображение статуса рейса в консоли.

Weeks 9–10 — Dual Transactions
	•	«Return empty + pick import» в одном заезде.
	•	Улучшение симуляции слотов (окна, лимиты, переносы).

Weeks 11–12 — Metrics & Polish
	•	Метрики: dwell, turn time, failed arrivals, hit rate.
	•	Отчёты в консоли.
	•	UI/UX улучшения (shadcn/ui, Tailwind).
	•	Тест на 50–100 «виртуальных грузовиков».

⸻

🧱 Минимальная схема данных (Prisma draft)

model Terminal {
  id           String    @id @default(cuid())
  name         String
  code         String    @unique
  slots        Slot[]
  containers   Container[]
}

model Vessel {
  id           String   @id @default(cuid())
  name         String
  eta          DateTime
  terminalId   String
  terminal     Terminal @relation(fields: [terminalId], references: [id])
  containers   Container[]
}

model Container {
  id           String   @id @default(cuid())
  cntrNo       String   @unique
  type         String   // 20GP/40HC...
  line         String   // CMA, MSC, MAE...
  readyAt      DateTime?
  hold         Boolean  @default(false)
  status       String   // NOT_READY | READY | PICKED | DELIVERED
  terminalId   String
  terminal     Terminal @relation(fields: [terminalId], references: [id])
  vesselId     String?
  vessel       Vessel?  @relation(fields: [vesselId], references: [id])
}

model Slot {
  id           String   @id @default(cuid())
  terminalId   String
  terminal     Terminal @relation(fields: [terminalId], references: [id])
  windowStart  DateTime
  windowEnd    DateTime
  capacity     Int      // per window
  booked       Int      @default(0)
}

model Driver {
  id           String   @id @default(cuid())
  name         String
  phone        String?
  truck        Truck?
  trips        Trip[]
}

model Truck {
  id           String   @id @default(cuid())
  driverId     String   @unique
  driver       Driver   @relation(fields: [driverId], references: [id])
  plate        String
  carrier      String
}

model Trip {
  id           String   @id @default(cuid())
  driverId     String
  driver       Driver   @relation(fields: [driverId], references: [id])
  containerId  String
  container    Container @relation(fields: [containerId], references: [id])
  pickupSlotId String?
  pickupSlot   Slot?    @relation(fields: [pickupSlotId], references: [id])
  returnEmpty  Boolean  @default(false)
  status       String   // ASSIGNED | STARTED | GATE_READY | FAILED | COMPLETED
  eta          DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  turnMinutes  Int?
}

model Event {
  id        String   @id @default(cuid())
  type      String   // VESSEL_ARRIVAL | CNTR_READY | HOLD_ADDED | TRIP_FAILED ...
  refId     String?  // container/trip/slot
  meta      Json?
  createdAt DateTime @default(now())
}


⸻

✅ Deliverables
	•	Рабочая система (Driver App + Dispatcher Console).
	•	Полная симуляция цепочки: контейнер → слот → рейс → ворота.
	•	Метрики в реальном времени.
	•	Доказательство ценности (снижение fail arrivals, рост hit rate).
	•	Готовность к Phase 2 (подключение реальных CSV/GPS данных).
