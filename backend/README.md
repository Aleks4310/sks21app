# SKS Quest — Backend

REST API модуля геймификации «SKS Quest» (Node.js + Express + PostgreSQL).
Бонусная экономика, ежедневный вход, квесты, колесо фортуны, каталог призов,
лидерборд/лиги, достижения, аналитика и ролевой доступ.

## Стек

- **Node.js / Express 5** — HTTP API
- **PostgreSQL** (`pg`) — хранилище
- **JWT** (`jsonwebtoken`) — авторизация
- **bcrypt** — хеширование паролей

## Структура

```
backend/
├── server.js              # точка входа (поднимает HTTP-сервер)
├── src/
│   ├── app.js             # конфигурация Express, CORS, подключение роутов
│   ├── config/
│   │   └── database.js     # пул pg + авто-создание таблиц и сид демо-данных
│   ├── routes/             # маршруты (URL → контроллер)
│   ├── controllers/        # обработка HTTP-запросов
│   ├── services/           # бизнес-логика (бонусы, лидерборд, ачивки, ...)
│   └── middleware/         # auth (JWT), roleCheck, rateLimit
├── Dockerfile
├── .env.example
└── README.md
```

Разделение слоёв: **routes** только маршрутизируют → **controllers** разбирают
запрос/ответ → **services** содержат бизнес-логику и работу с БД.

## Запуск

### Вариант A — Docker (рекомендуется, из корня репозитория)

```bash
docker compose up --build
```

Поднимет PostgreSQL и бэкенд. API будет на `http://localhost:5000`.
При первом старте БД автоматически создаётся и засевается демо-данными.

### Вариант B — локально

Нужен запущенный PostgreSQL.

```bash
cd backend
cp .env.example .env        # при необходимости поправьте доступы к БД
npm install
npm run dev                 # с авто-перезапуском (nodemon)
# или: npm start
```

Проверка: `curl http://localhost:5000/api/health` → `{"status":"OK",...}`

## Переменные окружения

| Переменная    | Назначение                                   | По умолчанию |
|---------------|----------------------------------------------|--------------|
| `PORT`        | порт HTTP-сервера                            | `5000`       |
| `DB_HOST`     | хост PostgreSQL (`localhost` / `db` в compose) | `localhost`  |
| `DB_PORT`     | порт PostgreSQL                              | `5432`       |
| `DB_NAME`     | имя БД                                        | `sks_quest`  |
| `DB_USER`     | пользователь БД                              | `postgres`   |
| `DB_PASSWORD` | пароль БД                                     | —            |
| `JWT_SECRET`  | секрет подписи JWT (**сменить в проде!**)    | —            |
| `CORS_ORIGIN` | разрешённые источники через запятую; пусто = любой | пусто  |

## Роли

| Роль                | Возможности                                            |
|---------------------|--------------------------------------------------------|
| `client`            | игровой цикл: вход, квесты, колесо, призы, лидерборд    |
| `marketing`         | создание квестов и кампаний                            |
| `admin`             | всё выше + управление каталогом                        |
| `marketing_analyst` | только чтение дашбордов аналитики                      |

## Демо-пользователи (сидятся автоматически)

| Email                | Пароль        | Роль        |
|----------------------|---------------|-------------|
| `user1@test.com`     | `password123` | client      |
| `user2@test.com`     | `password123` | client      |
| `marketing@test.com` | `password123` | marketing   |
| `admin@test.com`     | `password123` | admin       |

## API

Базовый префикс: `/api`. Все защищённые маршруты требуют заголовок
`Authorization: Bearer <token>`.

### Auth
| Метод | Путь                | Доступ  | Описание                       |
|-------|---------------------|---------|--------------------------------|
| POST  | `/api/auth/register`| —       | регистрация (роль `client`)    |
| POST  | `/api/auth/login`   | —       | вход, возвращает JWT           |
| GET   | `/api/auth/me`      | auth    | текущий пользователь           |
| PUT   | `/api/auth/profile` | auth    | обновить псевдоним/аватар      |

### Игровой цикл (роль client)
| Метод | Путь                              | Описание                          |
|-------|-----------------------------------|-----------------------------------|
| POST  | `/api/checkin/daily`              | ежедневный вход (+бонусы, серия)  |
| POST  | `/api/checkin/freeze`             | купить заморозку серии (−100)     |
| GET   | `/api/quests/daily`               | 3 квеста на сегодня               |
| GET   | `/api/quests`                     | список активных квестов           |
| POST  | `/api/quests/:questId/complete`   | выполнить квест                   |
| POST  | `/api/wheel/spin`                 | крутить колесо фортуны            |
| GET   | `/api/marketplace`                | каталог призов (`?category=`)     |
| GET   | `/api/marketplace/:itemId`        | карточка приза                    |
| POST  | `/api/marketplace/:itemId/purchase`| купить приз за бонусы            |
| GET   | `/api/leaderboard`                | месячный лидерборд                |
| GET   | `/api/leaderboard/my-rank`        | моя позиция                       |
| GET   | `/api/leaderboard/league`         | моя лига                          |
| GET   | `/api/achievements/my`            | мои достижения                    |
| GET   | `/api/achievements`               | все достижения                    |

### Маркетинг / Аналитика
| Метод | Путь                      | Доступ                              |
|-------|---------------------------|-------------------------------------|
| POST  | `/api/quests`             | marketing, admin — создать квест    |
| POST  | `/api/marketing/campaign` | marketing, admin — сезонная кампания|
| GET   | `/api/marketing/campaigns`| marketing, analyst, admin           |
| GET   | `/api/analytics/stats`    | marketing, analyst, admin — DAU/MAU |
| GET   | `/api/analytics/daily`    | marketing, analyst, admin (`?days=`)|

### Бонусы
| Метод | Путь                 | Доступ | Описание                          |
|-------|----------------------|--------|-----------------------------------|
| GET   | `/api/bonus/balance` | auth   | текущий баланс (неистёкшие бонусы)|
| GET   | `/api/bonus/history` | auth   | история транзакций (`?limit=`)    |

### Прочее
| Метод | Путь          | Описание           |
|-------|---------------|--------------------|
| GET   | `/api/health` | проверка живости   |

### Пример

```bash
# вход
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}' | jq -r .token)

# ежедневный вход
curl -X POST http://localhost:5000/api/checkin/daily \
  -H "Authorization: Bearer $TOKEN"
```

## Бонусная экономика

- начисления/списания пишутся в `bonus_transactions` (журнал, audit log);
- баланс = сумма неистёкших транзакций;
- списание по FIFO (`bonusService.spend`), срок жизни бонуса — 12 месяцев;
- достижения проверяются и выдаются автоматически после начислений
  (`bonusService.checkAchievements`).

## Интеграция с мобильным приложением

Flutter-приложение в `mobile/` уже подключено к этому API:
- HTTP-клиент — `mobile/lib/services/api_service.dart` (адрес выбирается
  автоматически: web → `localhost`, устройство → LAN-IP; переопределяется
  через `--dart-define=API_BASE_URL=...`);
- бизнес-логика — `mobile/lib/providers/app_provider.dart` ходит на эндпоинты
  выше и маппит ответы в модели;
- вход: экран логина выбирает роль, под капотом приложение логинится под
  соответствующим демо-аккаунтом (Client → `user1@`, Marketing → `marketing@`,
  Admin/Analyst → `admin@`).

Сквозную работу связки проверяет `mobile/test/backend_integration_test.dart`
(запускать при поднятом сервере).
