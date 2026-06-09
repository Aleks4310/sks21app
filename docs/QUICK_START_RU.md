# 🚀 БЫСТРЫЙ СТАРТ - SKS QUEST BACKEND

## 🎯 Что это?

Backend для системы геймификации мобильного приложения "СКС Онлайн" на Node.js + Express + PostgreSQL

## 📋 Требования

- Node.js 16+
- PostgreSQL 12+
- npm или yarn

## ⚡ 5 минут на старт

### 1️⃣ Клонирование и установка

```bash
cd gamepr
npm install
```

### 2️⃣ Настройка БД

Убедитесь, что PostgreSQL запущен с параметрами из `.env`:
- Хост: localhost
- Порт: 5432
- Пользователь: postgres
- Пароль: postgre
- База: sks_quest (создаётся автоматически)

### 3️⃣ Запуск сервера

```bash
# Разработка (с автоперезагрузкой)
npm run dev

# Или продакшн
npm start
```

Сервер запустится на **http://localhost:5000**

## 🧪 Быстрое тестирование

### Проверить здоровье
```bash
curl http://localhost:5000/api/health
```

### Регистрация
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "password123",
    "username": "MyPlayer"
  }'
```

### Вход
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "password123"
  }'
```

Получите токен и используйте его для других запросов:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

## 🎮 Основные игровые операции

### Получить ежедневный бонус
```bash
curl -X POST http://localhost:5000/api/checkin/daily \
  -H "Authorization: Bearer TOKEN"
```

### Получить квесты
```bash
curl http://localhost:5000/api/quests/daily \
  -H "Authorization: Bearer TOKEN"
```

### Выполнить квест
```bash
curl -X POST http://localhost:5000/api/quests/1/complete \
  -H "Authorization: Bearer TOKEN"
```

### Крутить колесо фортуны
```bash
curl -X POST http://localhost:5000/api/wheel/spin \
  -H "Authorization: Bearer TOKEN"
```

### Получить товары
```bash
curl http://localhost:5000/api/marketplace \
  -H "Authorization: Bearer TOKEN"
```

### Купить товар
```bash
curl -X POST http://localhost:5000/api/marketplace/1/purchase \
  -H "Authorization: Bearer TOKEN"
```

### Получить лидерборд
```bash
curl http://localhost:5000/api/leaderboard \
  -H "Authorization: Bearer TOKEN"
```

### Получить мои достижения
```bash
curl http://localhost:5000/api/achievements/my \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Аналитика (для маркетинга)

### Получить статистику (Marketing роль)
```bash
curl http://localhost:5000/api/analytics/stats \
  -H "Authorization: Bearer TOKEN"
```

### Получить ежедневные данные
```bash
curl "http://localhost:5000/api/analytics/daily?days=30" \
  -H "Authorization: Bearer TOKEN"
```

## 🔐 Тестовые учётные записи

Уже созданы при запуске:

```
Email: user1@test.com
Password: password123
Role: client (обычный игрок)

---

Email: marketing@test.com
Password: password123
Role: marketing (может создавать квесты)

---

Email: admin@test.com
Password: password123
Role: admin (полный доступ)
```

## 🛠️ Для разработчиков

### Структура кода
- **controllers/** - Логика обработки запросов
- **services/** - Бизнес-логика (бонусы, достижения, лидерборд)
- **routes/** - Определение эндпоинтов
- **middleware/** - Проверка прав, rate limiting
- **config/** - Конфигурация БД

### Добавить новый эндпоинт

1. Создать контроллер в `/controllers/`
2. Создать маршрут в `/routes/`
3. Добавить маршрут в `app.js`

Пример:

```javascript
// controllers/myController.js
const MyController = {
    getData: async (req, res) => {
        res.json({ message: 'Hello' });
    }
};
module.exports = MyController;

// routes/myRoutes.js
const express = require('express');
const router = express.Router();
const MyController = require('../controllers/myController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, MyController.getData);

module.exports = router;

// app.js
app.use('/api/my', require('./routes/myRoutes'));
```

## 📝 Переменные окружения (.env)

```env
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sks_quest
DB_USER=postgres
DB_PASSWORD=postgre

# JWT
JWT_SECRET=sks_secret_key
```

## 🔄 Полный API список

| Метод | Путь | Роль | Описание |
|-------|------|------|---------|
| POST | /api/auth/register | - | Регистрация |
| POST | /api/auth/login | - | Вход |
| GET | /api/auth/me | client | Мой профиль |
| PUT | /api/auth/profile | client | Обновить профиль |
| POST | /api/checkin/daily | client | Получить бонус за вход |
| POST | /api/checkin/freeze | client | Купить заморозку серии |
| GET | /api/quests/daily | client | Получить ежедневные квесты |
| POST | /api/quests/:id/complete | client | Выполнить квест |
| POST | /api/wheel/spin | client | Крутить колесо |
| GET | /api/marketplace | client | Товары |
| POST | /api/marketplace/:id/purchase | client | Купить товар |
| GET | /api/leaderboard | client | Лидерборд |
| GET | /api/achievements/my | client | Мои достижения |
| GET | /api/analytics/stats | marketing | Статистика |

## 🐛 Если что-то не работает

### Сервер не запускается?
```bash
# Проверить, запущен ли PostgreSQL
# Проверить .env файл
# Смотреть логи в консоли
```

### Ошибка подключения к БД?
```bash
# Убедиться, что PostgreSQL слушает на localhost:5432
# Проверить пароль в .env
# Создать базу данных: createdb sks_quest
```

### Токен не работает?
```bash
# Убедиться, что копируете токен полностью
# Проверить, что токен в заголовке: Authorization: Bearer TOKEN
# Проверить JWT_SECRET в .env
```

## 📖 Полная документация

Смотрите **README.md** для полной документации API с примерами запросов/ответов.

## 🎉 Готово!

Ваш backend готов к использованию! Интегрируйте с фронтенд приложением и начните тестировать.

Удачи! 🚀
