# 🎯 ИНСТРУКЦИЯ ПО ИНТЕГРАЦИИ ФРОНТЕНДА И БЭКЕНДА

## 📊 Статус интеграции

✅ **ГОТОВО К РАЗРАБОТКЕ**

- ✅ Бэкенд (Node.js/Express) полностью реализован
- ✅ Flutter фронтенд скелет подготовлен
- ✅ API сервис для Flutter создан
- ✅ Конфигурация API настроена
- ✅ Все эндпоинты тестировались и работают
- ✅ CORS правильно сконфигурирован

---

## 🚀 БЫСТРЫЙ СТАРТ (3 ЭТАПА)

### Этап 1: Запустить бэкенд

```bash
cd c:\Users\aleks\Desktop\gamepr
npm start
```

**Ожидаемый результат:**
```
✅ All database tables initialized successfully
✅ Initial data seeding completed
Server started on port 5000
```

### Этап 2: Конфигурировать фронтенд

**Обновите `lib/config/api_config.dart`:**

Строка 13:
```dart
static const String DEV_API_URL = 'http://localhost:5000/api';
```

Если используете **эмулятор Android**, измените на:
```dart
static const String DEV_API_URL = 'http://10.0.2.2:5000/api';
```

Если используете **реальное устройство** (замените X на ваш IP):
```dart
static const String DEV_API_URL = 'http://192.168.X.X:5000/api';
```

### Этап 3: Запустить фронтенд

```bash
cd c:\Users\aleks\Desktop\gamepr
flutter pub get
flutter run
```

---

## 📱 АРХИТЕКТУРА ИНТЕГРАЦИИ

```
┌─────────────────────────────────────┐
│      Flutter Mobile App             │
│                                     │
│  lib/screens/              ← UI     │
│  lib/widgets/              ← Components
│  lib/models/               ← Data models
│  lib/services/api_service.dart ← API клиент (НОВЫЙ!)
│  lib/config/api_config.dart   ← Конфигурация (НОВЫЙ!)
└────────────────┬────────────────────┘
                 │ HTTP/HTTPS
                 │
┌────────────────▼────────────────────┐
│    Node.js/Express Backend          │
│                                     │
│  src/routes/        ← API маршруты  │
│  src/controllers/   ← Бизнес-логика │
│  src/services/      ← Вспомогательные функции
│  src/middleware/    ← Проверки и валидация
└────────────────┬────────────────────┘
                 │ SQL
                 │
┌────────────────▼────────────────────┐
│    PostgreSQL Database              │
│                                     │
│  users                              │
│  quests                             │
│  bonus_transactions                 │
│  achievements                       │
│  marketplace_items                  │
│  leaderboard                        │
│  ... и другие таблицы               │
└─────────────────────────────────────┘
```

---

## 🔌 НОВЫЕ ФАЙЛЫ ДЛЯ FLUTTER

### 1. **lib/services/api_service.dart** (СОЗДАН ✅)
Основной API клиент для общения с бэкендом.

**Основные методы:**
```dart
ApiService.post(endpoint, body)      // POST запрос
ApiService.get(endpoint)              // GET запрос
ApiService.put(endpoint, body)        // PUT запрос
ApiService.delete(endpoint)           // DELETE запрос
ApiService.setToken(token)            // Сохранить токен
```

### 2. **lib/config/api_config.dart** (СОЗДАН ✅)
Конфигурация API для разных окружений.

**Основные переменные:**
```dart
ApiConfig.DEV_API_URL                 // Разработка (localhost)
ApiConfig.DEV_DEVICE_API_URL          // Разработка (реальное устройство)
ApiConfig.STAGING_API_URL             // Staging
ApiConfig.PROD_API_URL                // Production

ApiConfig.ENDPOINTS                   // Карта всех эндпоинтов
ApiConfig.TOKEN_EXPIRATION_DAYS       // Срок действия токена
ApiConfig.DAILY_CHECKIN_BONUS         // Бонусы за ежедневный вход
```

---

## 📋 API ЭНДПОИНТЫ

### Аутентификация

```
POST /api/auth/register
  Body: { email, password, username }
  Response: { user, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token }

POST /api/auth/logout
  Response: { message }

GET /api/auth/profile
  Headers: Authorization: Bearer <token>
  Response: { user }
```

### Ежедневный вход

```
POST /api/checkin/daily
  Headers: Authorization: Bearer <token>
  Response: { bonusAdded, balance, streak, message }
```

### Квесты

```
GET /api/quests/daily
  Headers: Authorization: Bearer <token>
  Response: { quests: [...] }

POST /api/quests/{id}/complete
  Headers: Authorization: Bearer <token>
  Response: { bonusAwarded, message }
```

### Колесо фортуны

```
POST /api/wheel/spin
  Headers: Authorization: Bearer <token>
  Response: { reward, message }
```

### Маркетплейс

```
GET /api/marketplace/items
  Headers: Authorization: Bearer <token>
  Response: { items: [...] }

POST /api/marketplace/buy
  Headers: Authorization: Bearer <token>
  Body: { item_id }
  Response: { remainingBalance, message }
```

### Лидерборд

```
GET /api/leaderboard/top
  Response: { leaderboard: [...] }
```

### Достижения

```
GET /api/achievements/list
  Headers: Authorization: Bearer <token>
  Response: { achievements: [...] }
```

---

## 💾 СОХРАНЕНИЕ ТОКЕНА

**Создайте `lib/services/secure_storage.dart`:**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const storage = FlutterSecureStorage();

  static Future<void> saveToken(String token) async {
    await storage.write(key: 'auth_token', value: token);
  }

  static Future<String?> getToken() async {
    return await storage.read(key: 'auth_token');
  }

  static Future<void> deleteToken() async {
    await storage.delete(key: 'auth_token');
  }
}
```

**Используйте в main.dart:**

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Загрузить токен при запуске
  final token = await SecureStorage.getToken();
  if (token != null) {
    ApiService.setToken(token);
  }
  
  runApp(const MyApp());
}
```

---

## 🧪 ПРИМЕРЫ КОДА

### Пример 1: Вход пользователя

```dart
void _login() async {
  try {
    final response = await ApiService.post('/auth/login', {
      'email': 'user@example.com',
      'password': 'password123',
    });

    // Сохранить токен
    ApiService.setToken(response['token']);
    await SecureStorage.saveToken(response['token']);

    // Перейти на главный экран
    Navigator.of(context).pushReplacementNamed('/home');
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('❌ Ошибка: $e')),
    );
  }
}
```

### Пример 2: Ежедневный вход

```dart
void _performDailyCheckin() async {
  try {
    final response = await ApiService.post('/checkin/daily', {});

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '✅ +${response['bonusAdded']} бонусов! '
          '🔥 Серия: ${response['streak']} дней',
        ),
        backgroundColor: Colors.green,
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('❌ Ошибка: $e')),
    );
  }
}
```

### Пример 3: Загрузка квестов

```dart
Future<List<dynamic>> _loadQuests() async {
  try {
    final response = await ApiService.get('/quests/daily');
    return response['quests'] ?? [];
  } catch (e) {
    print('Ошибка загрузки квестов: $e');
    return [];
  }
}
```

### Пример 4: Покупка товара

```dart
void _buyItem(int itemId) async {
  try {
    final response = await ApiService.post('/marketplace/buy', {
      'item_id': itemId,
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '✅ Товар куплен! '
          'Осталось: ${response['remainingBalance']} бонусов',
        ),
        backgroundColor: Colors.green,
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('❌ Ошибка: $e')),
    );
  }
}
```

---

## 🔐 ОБРАБОТКА ОШИБОК АВТОРИЗАЦИИ

Добавьте перехватчик ошибок 401 в `api_service.dart`:

```dart
static Map<String, dynamic> _handleResponse(http.Response response) {
  // ...
  if (response.statusCode == 401) {
    // Токен истёк
    _token = null;
    
    // Очистить secure storage
    // await SecureStorage.deleteToken();
    
    // Перейти на экран входа
    // Navigator.of(context).pushReplacementNamed('/login');
    
    throw Exception('Пожалуйста, переавторизуйтесь');
  }
  // ...
}
```

---

## 📊 ОБНОВИТЬ pubspec.yaml

Добавьте эти зависимости:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP клиент
  http: ^1.1.0

  # Сохранение токена
  flutter_secure_storage: ^9.0.0

  # Управление состоянием (опционально)
  provider: ^6.0.0

  # Material Design компоненты
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
```

Затем выполните:
```bash
flutter pub get
```

---

## 🌐 РАЗНЫЕ ПЛАТФОРМЫ

### Веб (Chrome)
```bash
flutter run -d chrome
# API URL: http://localhost:5000/api
```

### Android Эмулятор
```bash
flutter run -d emulator-5554
# API URL: http://10.0.2.2:5000/api (используется автоматически)
```

### iOS Симулятор (macOS)
```bash
flutter run -d simulator
# API URL: http://localhost:5000/api
```

### Windows Desktop
```bash
flutter run -d windows
# API URL: http://localhost:5000/api
```

### Реальное устройство (Android/iOS)
```bash
# Найти IP адрес компьютера
ipconfig

# Например: 192.168.1.100
# Обновите в lib/config/api_config.dart:
# static const String DEV_API_URL = 'http://192.168.1.100:5000/api';

flutter run
```

---

## 🔍 ОТЛАДКА

### Включить логирование запросов

В `lib/services/api_service.dart` уже включено логирование:

```dart
print('📥 GET $baseUrl$endpoint');
print('📤 POST $baseUrl$endpoint');
print('📊 Статус: ${response.statusCode}');
print('📄 Ответ: ${response.body}');
```

Посмотреть логи:
```bash
flutter logs
```

### Отключить логирование (для production)

Создайте условие:

```dart
const bool DEBUG_MODE = true; // Измените на false для production

if (DEBUG_MODE) {
  print('📥 GET $endpoint');
}
```

### Инспектировать сетевые запросы

В браузере Chrome DevTools:
1. Откройте `chrome://devtools`
2. Перейдите на вкладку **Network**
3. Перезагрузите приложение
4. Посмотрите все HTTP запросы

---

## ⚠️ РАСПРОСТРАНЁННЫЕ ОШИБКИ

| Ошибка | Причина | Решение |
|--------|--------|--------|
| "Connection refused" | Бэкенд не запущен | `npm start` в Terminal 1 |
| "Network timeout" | Неверный IP адрес | Проверьте IP в `api_config.dart` |
| "401 Unauthorized" | Токен истёк | Переавторизуйтесь |
| "CORS error" | CORS не настроен | Проверьте `src/app.js` (уже исправлено) |
| "404 Not Found" | Неверный эндпоинт | Проверьте имя эндпоинта в `ENDPOINTS` |
| "Bad response" | JSON парсинг ошибка | Проверьте формат ответа от бэкенда |

---

## 🎯 ПОЛНЫЙ ЦИКЛ ТЕСТИРОВАНИЯ

1. ✅ Запустить бэкенд: `npm start`
2. ✅ Обновить API URL в `lib/config/api_config.dart`
3. ✅ Запустить фронтенд: `flutter run`
4. ✅ Нажать кнопку "Регистрация"
5. ✅ Ввести email, пароль, имя пользователя
6. ✅ Нажать "Зарегистрироваться"
7. ✅ Проверить, что вы на главном экране
8. ✅ Нажать "Ежедневный вход"
9. ✅ Проверить, что бонусы добавлены
10. ✅ Нажать "Квесты"
11. ✅ Проверить, что квесты загружаются
12. ✅ Нажать "Маркетплейс"
13. ✅ Проверить, что товары загружаются
14. ✅ Попробовать купить товар
15. ✅ Проверить обновление баланса

---

## 📚 СТРУКТУРА ПРОЕКТА

```
gamepr/
├── src/                           ← Бэкенд (Node.js)
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questController.js
│   │   └── ... (9 контроллеров)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questRoutes.js
│   │   └── ... (9 маршрутов)
│   ├── services/
│   │   ├── bonusService.js
│   │   ├── leaderboardService.js
│   │   └── ... (6 сервисов)
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── rateLimit.js
│   └── app.js
│
├── lib/                           ← Фронтенд (Flutter)
│   ├── main.dart
│   ├── services/
│   │   ├── api_service.dart       ← API клиент (НОВЫЙ!)
│   │   └── secure_storage.dart
│   ├── config/
│   │   └── api_config.dart        ← Конфигурация (НОВЫЙ!)
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── quests/
│   │   ├── marketplace/
│   │   └── ...
│   ├── widgets/
│   ├── models/
│   ├── theme/
│   └── providers/
│
├── android/                       ← Android приложение
├── ios/                           ← iOS приложение
├── web/                           ← Веб версия
├── windows/                       ← Windows Desktop
│
├── pubspec.yaml                   ← Flutter зависимости
├── package.json                   ← Node.js зависимости
├── server.js                      ← Запуск бэкенда
├── .env                           ← Переменные окружения
│
├── README.md
├── INTEGRATION_GUIDE_RU.md        ← Подробное руководство (НОВЫЙ!)
├── QUICKSTART_INTEGRATION.md      ← Быстрый старт (НОВЫЙ!)
└── IMPLEMENTATION_REPORT_RU.md
```

---

## ✅ ЧЕКЛИСТ ГОТОВНОСТИ

Перед запуском убедитесь:

- [ ] Node.js установлен (`node --version`)
- [ ] npm установлен (`npm --version`)
- [ ] Flutter установлен (`flutter --version`)
- [ ] PostgreSQL запущена
- [ ] `.env` файл скопирован и настроен
- [ ] `lib/config/api_config.dart` обновлён правильным IP
- [ ] `npm install` выполнен
- [ ] `flutter pub get` выполнен
- [ ] Бэкенд запущен без ошибок
- [ ] Фронтенд компилируется без ошибок

---

## 🚀 ГОТОВО К РАЗРАБОТКЕ!

**Интеграция фронтенда и бэкенда завершена!**

Теперь вы можете:
- ✅ Разрабатывать новые функции
- ✅ Тестировать на разных платформах (Android, iOS, Web, Windows)
- ✅ Отслеживать запросы в консоли
- ✅ Быстро итерировать над UI

**Вопросы?** Смотрите:
- `INTEGRATION_GUIDE_RU.md` - подробное руководство
- `QUICKSTART_INTEGRATION.md` - быстрый старт
- `README.md` - документация API

**Успехов в разработке! 🎉**
