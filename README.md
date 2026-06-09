# SKS Quest

Модуль геймификации мобильного приложения «СКС Онлайн»: ежедневный вход,
квесты, колесо фортуны, каталог призов за бонусы, лидерборд/лиги, достижения
и аналитика для маркетинга.

Репозиторий — **монорепо** с чётким разделением бэкенда и фронтенда:

```
gamepr/
├── backend/            # REST API (Node.js + Express + PostgreSQL)
│   ├── src/            #   routes / controllers / services / middleware
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md       #   ← документация API и запуск бэкенда
├── mobile/             # мобильное приложение (Flutter)
│   ├── lib/            #   экраны, провайдеры, сервисы, виджеты
│   └── pubspec.yaml
├── docs/               # дополнительная документация и заметки
├── docker-compose.yml  # бэкенд + PostgreSQL одной командой
└── README.md           # этот файл
```

## Быстрый старт

### Бэкенд + база данных (Docker)

```bash
docker compose up --build
```

API поднимется на `http://localhost:5000` (проверка:
`curl http://localhost:5000/api/health`). База создаётся и засевается
демо-данными автоматически. Подробнее — в [backend/README.md](backend/README.md).

### Бэкенд локально (без Docker)

Нужен запущенный PostgreSQL. См. [backend/README.md](backend/README.md).

### Мобильное приложение (Flutter)

```bash
cd mobile
flutter pub get
flutter run            # для проверки в браузере: flutter run -d chrome
```

Приложение подключено к бэкенду. На экране входа выберите роль — приложение
залогинится под демо-аккаунтом этой роли. Адрес API задаётся автоматически
(`mobile/lib/services/api_service.dart`): web → `localhost`, реальное
устройство → IP ПК в Wi-Fi. Переопределить:
`flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api` (эмулятор).

> Бэкенд должен быть запущен (`cd backend && npm start`), иначе вход выдаст
> «Нет связи с сервером».

## Документация

- [backend/README.md](backend/README.md) — API, роли, переменные окружения, запуск.
- [docs/](docs/) — отчёты и заметки по интеграции фронтенда и бэкенда.

## Технологический стек

| Слой      | Технологии                                  |
|-----------|---------------------------------------------|
| Backend   | Node.js, Express 5, PostgreSQL, JWT, bcrypt |
| Frontend  | Flutter (Dart), Provider, go_router         |
| Инфра     | Docker, docker-compose                      |
