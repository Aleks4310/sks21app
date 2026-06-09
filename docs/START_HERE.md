# 🚀 ЗАПУСТИТЬ ПРЯМО СЕЙЧАС - 3 КОМАНДЫ

## ⚡ Быстрый старт (5 минут)

Скопируйте и выполните эти команды в PowerShell.

### Шаг 1: Запустить бэкенд (Terminal 1)

```powershell
cd c:\Users\aleks\Desktop\gamepr
npm start
```

**Ждите вывода:**
```
✅ All database tables initialized successfully
✅ Initial data seeding completed
Server started on port 5000
```

**НЕ ЗАКРЫВАЙТЕ этот терминал! Оставьте его работать.**

---

### Шаг 2: Запустить фронтенд (Terminal 2 - новое окно)

```powershell
cd c:\Users\aleks\Desktop\gamepr
flutter pub get
flutter run
```

**Выберите платформу:**
```
? Which device do you want to target?

[1] chrome (web)            ← ВЫБЕРите ДЛЯ БЫСТРОГО ТЕСТИРОВАНИЯ
[2] windows (desktop)
```

Введите `1` и нажмите Enter для запуска в браузере Chrome.

**РЕЗУЛЬТАТ:** Приложение откроется в Chrome!

---

### Шаг 3: Тестировать в приложении

1. 👤 Нажмите кнопку **"Регистрация"**
2. 📝 Заполните форму:
   - Email: `test@example.com`
   - Пароль: `TestPassword123`
   - Имя: `TestUser`
3. ✅ Нажмите **"Зарегистрироваться"**
4. 🎉 Вы должны попасть на главный экран!

**Поздравляем! Интеграция работает! 🎊**

---

## 🔍 Проверить, что всё работает

### В браузере (где запущено приложение):
- [ ] Видна кнопка "Регистрация"
- [ ] Форма может быть заполнена
- [ ] После регистрации видны игровые функции

### В Terminal 1 (бэкенд):
- [ ] Видны логи запросов (например: `POST /api/auth/register`)
- [ ] Нет красных ошибок
- [ ] Сервер продолжает работать

### В Terminal 2 (фронтенд):
- [ ] Приложение скомпилировалось без ошибок
- [ ] Нет красных ошибок в консоли
- [ ] Видны logs запросов (если включены)

**Если всё выше - ВСЁ РАБОТАЕТ! ✅**

---

## 🆘 Если ошибка

### Ошибка: "Connection refused"
```
❌ Cannot connect to http://localhost:5000
```
**Решение:** Убедитесь, что Terminal 1 с `npm start` ещё работает.

### Ошибка: "Port 5000 already in use"
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Решение:** Закройте другие Node.js процессы или используйте другой порт.

### Ошибка: "Failed to compile"
```
❌ Error compiling application
```
**Решение:** Выполните `flutter clean` и попробуйте снова.

---

## 📊 Что видеть в консолях

### Terminal 1 (Node.js бэкенд) - нормальные логи:
```
✅ All database tables initialized successfully
✅ Initial data seeding completed
Server started on port 5000
📥 GET /api/health
📤 POST /api/auth/register
✅ Success
```

### Terminal 2 (Flutter фронтенд) - нормальные логи:
```
Compiling assets...
Building for chrome (web)...
App finished loading in 3.2s
🌐 Running on http://localhost:xxxxx
Press 'q' to quit.
```

### Браузер Chrome - нормальный вид:
```
Верхняя часть экрана: "СКС Онлайн"
Кнопка: "🔐 Вход" / "📝 Регистрация"
```

---

## ✅ Checklist успешной интеграции

- [ ] Terminal 1: `npm start` показывает "Server started on port 5000"
- [ ] Terminal 2: `flutter run` показывает "App finished loading"
- [ ] Браузер Chrome открылся с приложением
- [ ] На экране видна форма входа/регистрации
- [ ] Можно ввести email и пароль
- [ ] После регистрации - вход на главный экран
- [ ] На главном экране видны игровые функции
- [ ] Terminal 1 показывает логи API запросов

**Всё это = успешная интеграция! 🎉**

---

## 📖 Дальше что?

После успешного запуска:

1. **Чтение документации:** [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md)
2. **Развиваться дальше:** [`DEVELOPER_CHECKLIST.md`](DEVELOPER_CHECKLIST.md)
3. **Понять архитектуру:** [`FRONTEND_BACKEND_INTEGRATION.md`](FRONTEND_BACKEND_INTEGRATION.md)
4. **Добавлять функции:** Смотрите примеры в [`lib/services/api_service.dart`](lib/services/api_service.dart)

---

## 🎯 Основные команды (сохраните себе)

```bash
# Запустить бэкенд
npm start

# Запустить фронтенд
flutter run

# Очистить Flutter
flutter clean

# Обновить зависимости Flutter
flutter pub get

# Посмотреть логи
flutter logs

# Проверить здоровье API
curl http://localhost:5000/api/health
```

---

## 🎮 Тестовые аккаунты

| Email | Пароль | Статус |
|-------|--------|--------|
| `test@example.com` | `TestPassword123` | Создаёте сами |
| `user1@test.com` | `password123` | В seed данных |
| `user2@test.com` | `password123` | В seed данных |
| `admin@test.com` | `password123` | Админ (seed) |

---

## 💡 Советы

1. **Кеш браузера:** Если видны старые данные, нажмите `Ctrl+Shift+R` (полная перезагрузка)
2. **Логирование:** Логи в Terminal 2 помогают отладке
3. **Консоль браузера:** F12 → Console для ошибок JavaScript
4. **Hot reload:** После изменений в Flutter кода автоматическая перезагрузка

---

## 🎉 Готово!

Теперь вы готовы к разработке!

**Интеграция фронтенда и бэкенда завершена!** ✅

---

_Последнее обновление: 2024_
_Для приложения "СКС Онлайн"_
_Разработано для быстрого запуска_
