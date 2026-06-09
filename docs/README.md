# SKS Quest Backend - Gamification System

Полнофункциональный backend для системы геймификации мобильного приложения "СКС Онлайн".

## 🎮 Возможности

- **Авторизация и роли** - JWT-аутентификация с ролевым доступом (Client, Marketing, Admin, Marketing Analyst)
- **Ежедневные входы** - Система серий входов с прогрессивными наградами
- **Квесты** - Ежедневные и сезонные квесты с системой выполнения
- **Колесо фортуны** - Вращение с прозрачными вероятностями и защитой от лудомании
- **Маркетплейс** - Покупка призов за накопленные бонусы
- **Лидерборд и лиги** - Анонимный лидерборд с еженедельным обновлением лиг
- **Достижения** - Система значков за различные вехи
- **Бонусная экономика** - ФИФО система с сроком жизни 12 месяцев
- **Аналитика** - DAU/MAU, доля завершения игр, распределение наград
- **Транзакционность** - Полная аудит-логирование всех операций с бонусами

## 🛠️ Требования

- Node.js 16+
- PostgreSQL 12+
- npm или yarn

## 📦 Установка

```bash
# Клонирование репозитория
git clone <repo-url>
cd gamepr

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env

# Заполнение .env файла
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sks_quest
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
# PORT=5000
```

## 🚀 Запуск

```bash
# Разработка (с автоперезагрузкой)
npm run dev

# Production
npm start
```

Сервер будет доступен по адресу `http://localhost:5000`

## 📝 API Документация

### Аутентификация

#### Регистрация
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "TestUser"
}
```

#### Вход
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Получение текущего пользователя
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Обновление профиля
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "pseudo_name": "NewName",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Ежедневный вход (Check-in)

#### Получить ежедневный бонус
```
POST /api/checkin/daily
Authorization: Bearer <token>

Response:
{
  "success": true,
  "streak": 7,
  "bonus_earned": 50,
  "message": "Вы получили 50 бонусов! Серия: 7 дней"
}
```

#### Купить заморозку серии
```
POST /api/checkin/freeze
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Заморозка серии активирована на 7 дней"
}
```

### Квесты

#### Получить ежедневные квесты
```
GET /api/quests/daily
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "title": "Проверить статус залога",
    "description": "Перейдите в раздел 'Залоги'...",
    "bonus_reward": 10,
    "is_seasonal": false,
    "is_active": true
  },
  ...
]
```

#### Выполнить квест
```
POST /api/quests/:questId/complete
Authorization: Bearer <token>

Response:
{
  "success": true,
  "bonus_earned": 10,
  "message": "Квест выполнен! Вы получили 10 бонусов"
}
```

#### Создать квест (Marketing/Admin)
```
POST /api/quests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Новый квест",
  "description": "Описание квеста",
  "bonus_reward": 50,
  "is_seasonal": false
}
```

### Колесо фортуны

#### Прокрутить колесо
```
POST /api/wheel/spin
Authorization: Bearer <token>

Response:
{
  "success": true,
  "reward": {
    "type": "bonus",
    "value": 100,
    "probability": 0.15
  },
  "message": "Спин выполнен!"
}
```

### Маркетплейс

#### Получить товары
```
GET /api/marketplace?category=financial
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "name": "Скидка 10% на проценты",
    "description": "Скидка на проценты...",
    "category": "financial",
    "price_bonus": 500,
    "image_url": "...",
    "remaining": 100
  },
  ...
]
```

#### Купить товар
```
POST /api/marketplace/:itemId/purchase
Authorization: Bearer <token>

Response:
{
  "success": true,
  "purchase": {
    "id": 1,
    "user_id": 1,
    "item_id": 1,
    "bonus_spent": 500,
    "status": "completed",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "Покупка выполнена! Товар: Скидка 10% на проценты"
}
```

### Лидерборд и лиги

#### Получить лидерборд
```
GET /api/leaderboard
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "pseudo_name": "Гость#12345",
    "avatar": "...",
    "monthly_bonus": 5000,
    "rank": 1
  },
  ...
]
```

#### Получить рейтинг текущего пользователя
```
GET /api/leaderboard/my-rank
Authorization: Bearer <token>
```

#### Получить лигу пользователя
```
GET /api/leaderboard/league
Authorization: Bearer <token>

Response:
{
  "id": 3,
  "name": "Золото",
  "min_bonus_month": 3000,
  "max_bonus_month": 6999,
  "rank_order": 3
}
```

### Достижения

#### Получить достижения пользователя
```
GET /api/achievements/my
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "name": "Первый шаг",
    "description": "Совершить первый вход...",
    "badge_icon": "/badges/first_step.png",
    "earned_at": "2024-01-01T10:00:00Z"
  },
  ...
]
```

#### Получить все достижения
```
GET /api/achievements
Authorization: Bearer <token>
```

### Аналитика (Marketing/Marketing Analyst/Admin)

#### Получить статистику
```
GET /api/analytics/stats
Authorization: Bearer <token>

Response:
{
  "active_users": {
    "dau": 150,
    "mau": 1200,
    "ratio": "12.5%"
  },
  "quest_completion": {
    "total_users": 200,
    "completed_users": 80,
    "rate": "40%"
  },
  "bonus_distribution": [
    {
      "transaction_type": "quest",
      "count": 500,
      "total": 7500
    },
    ...
  ]
}
```

#### Получить ежедневную статистику
```
GET /api/analytics/daily?days=30
Authorization: Bearer <token>
```

### Маркетинг (Marketing/Admin)

#### Создать кампанию
```
POST /api/marketing/campaign
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Новогодний квест",
  "description": "Праздничная кампания",
  "start_date": "2024-12-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "bonus_reward": 500
}
```

#### Получить кампании
```
GET /api/marketing/campaigns
Authorization: Bearer <token>
```

## 📊 Структура данных

### Таблицы в БД

- **users** - Пользователи с ролями и статистикой
- **quests** - Ежедневные и сезонные квесты
- **user_quest_progress** - Прогресс выполнения квестов
- **bonus_transactions** - Полная история всех транзакций с бонусами (аудит-лог)
- **achievements** - Определения достижений
- **user_achievements** - Выданные пользователям достижения
- **marketplace_items** - Каталог товаров
- **user_purchases** - История покупок
- **wheel_spins** - История прокруток колеса
- **leagues** - Лиги (Бронза, Серебро, Золото, Платина, Бриллиант)
- **user_league_history** - История участия пользователей в лигах

## 🔐 Ролевая модель

- **client** - Обычный пользователь приложения
- **marketing** - Может создавать квесты и кампании
- **admin** - Полный доступ к управлению системой
- **marketing_analyst** - Доступ к аналитическим дашбордам (только чтение)

## 💰 Бонусная экономика

- 1 бонус = 1 рубль оплаченных процентов
- Срок жизни бонусов: 12 месяцев
- Система ФИФО при списании
- Полное логирование всех операций

### Источники бонусов

- **Ежедневный вход** - 5 бонусов + прогрессивные награды (7 дн=50, 14 дн=150, 30 дн=500)
- **Квесты** - 10-200 бонусов в зависимости от квеста
- **Колесо фортуны** - 10-500 бонусов
- **Достижения** - Переменная награда
- **Оплата процентов** - Наследуется из программы лояльности

## 🛡️ Защита от лудомании

- Максимум 5 платных прокруток колеса в день
- Прозрачные вероятности для всех механик
- Запрет на реальные денежные выигрыши
- Лимиты на участие

## 📋 Инструкция для маркетинга

1. Авторизуйтесь с ролью "marketing"
2. Создавайте квесты через `/api/quests`
3. Создавайте сезонные кампании через `/api/marketing/campaign`
4. Просматривайте аналитику через `/api/analytics/stats`

## 🧪 Тестирование

### Тестовые учётные записи

```
Email: user1@test.com
Password: password123
Role: client

Email: marketing@test.com
Password: password123
Role: marketing

Email: admin@test.com
Password: password123
Role: admin
```

## 📈 Ключевые метрики

- DAU/MAU соотношение
- Доля пользователей, выполняющих квесты (целевой показатель ≥40%)
- Доля пользователей, потративших бонусы (целевой показатель ≥30%)
- Средняя длина серии входов (целевой показатель ≥7 дней)
- Удержание пользователей 30/60/90 дней

## 🔄 Интеграции

Система готова к интеграции с:
- Программой лояльности (получение баланса бонусов)
- Битрикс24 (передача событий)
- Push-уведомлениями
- Telegram-ботом
- SMS-сервисом

## 📝 Лицензия

ISC

SKS Quest — Геймификация СКС Онлайн
Хакатон СКС Ломбард | MVP Flutter-приложение

О проекте
SKS Quest — модуль геймификации для мобильного приложения «СКС Онлайн». Превращает накопление бонусов в увлекательную игру с ежедневными квестами, Колесом фортуны, каталогом призов и лидербордом.

Реализованный функционал MVP
Механика	Статус
🔐 Авторизация (JWT + биометрия)	✅
👤 Ролевая модель (Client / Marketing / Admin / Analyst)	✅
🔥 Ежедневный вход (Daily Check-in + серия)	✅
🎯 Ежедневные квесты (3 в день, выбор 1)	✅
🌟 Сезонные квесты с прогрессом	✅
🎡 Колесо фортуны (прозрачные вероятности)	✅
🏆 Каталог призов (5 категорий)	✅
🎖️ Достижения и бейджи (12 штук)	✅
📊 Анонимный лидерборд + лиги	✅
📈 Аналитический дашборд (DAU/MAU, конверсии)	✅
🛠️ Конструктор квестов для маркетинга	✅
💰 Бонусная экономика (история транзакций)	✅
Стек
Frontend: Flutter 3.x + Dart
State management: Provider
Charts: fl_chart
Backend: FastAPI + PostgreSQL + Redis (в разработке)
Установка и запуск
git clone https://github.com/your-team/sks-quest
cd sks_quest
flutter pub get
flutter run
Демо-данные
Роль	Телефон	Код	Описание
Клиент	любой	1234	Полный игровой цикл
Маркетинг	любой	1234	+ создание квестов
Аналитик	любой	1234	+ дашборд аналитики
Структура проекта
lib/
├── main.dart                 # Точка входа
├── theme/app_theme.dart      # Дизайн-система SKS
├── models/models.dart        # Все модели данных
├── providers/app_provider.dart # State management
├── screens/
│   ├── auth/                 # Авторизация
│   ├── home/                 # Главный экран + shell
│   ├── quests/               # Квесты + конструктор
│   ├── wheel/                # Колесо фортуны
│   ├── marketplace/          # Каталог призов
│   ├── leaderboard/          # Лидерборд + достижения
│   └── analytics/            # Аналитика
└── widgets/                  # Переиспользуемые виджеты
Соответствие требованиям
✅ 152-ФЗ: согласие на участие, право на отказ
✅ Антилудомания: лимит 5 прокруток/день, нет реальных ставок
✅ Комплаенс: прозрачные вероятности Колеса, термин «акция», не «лотерея»
✅ Анонимность: лидерборд без ФИО/телефонов
✅ Транзакционность: ФИФО-списание, история всех операций
Метрики успеха (цели)
DAU/MAU: >30% (текущий <10%)
Средняя серия входов: ≥7 дней
Доля выполняющих квест: ≥40%
Конверсия в каталог: ≥30%
Снижение оттока: -15-20%
Команда
Укажи здесь состав своей команды

Контакты
Вопросы по ТЗ: @Peter_Welch, @mysonisalawyer (Telegram)