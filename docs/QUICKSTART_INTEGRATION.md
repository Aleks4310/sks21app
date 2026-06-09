# ⚡ БЫСТРЫЙ СТАРТ - ОБЪЕДИНЁННАЯ РАЗРАБОТКА

## 🎯 Цель

Это руководство объясняет, как запустить **фронтенд** и **бэкенд** одновременно и проверить, что они работают вместе.

---

## 🚀 ЗАПУСК (Вариант 1: Два терминала)

### Терминал 1️⃣: Запуск бэкенда (Node.js)

```bash
# Перейти в папку проекта
cd c:\Users\aleks\Desktop\gamepr

# Установить зависимости (если ещё не установлены)
npm install

# Запустить сервер
npm start
```

**Ожидаемый вывод:**
```
✅ Database connection established
✅ Server running on http://localhost:5000
```

### Терминал 2️⃣: Запуск фронтенда (Flutter)

```bash
# В новом окне PowerShell
cd c:\Users\aleks\Desktop\gamepr

# Загрузить зависимости Flutter
flutter pub get

# Запустить приложение
flutter run
```

**Выбрать платформу:**
```
? Which device do you want to target?

[1] chrome (web)
[2] windows (desktop)
[3] Android Emulator (мобильный)
```

Для быстрого тестирования выберите **Chrome** (1).

---

## 🧪 ПРОВЕРКА СВЯЗИ

### Шаг 1: Проверить здоровье бэкенда

**В новом терминале:**

```bash
curl http://localhost:5000/api/health
```

**Ожидаемый ответ:**
```json
{
  "status": "OK",
  "message": "SKS Quest Backend is running"
}
```

### Шаг 2: Тест регистрации

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "flutter_test@example.com",
    "password": "TestPassword123",
    "username": "FlutterTestUser"
  }'
```

**Ожидаемый ответ:**
```json
{
  "message": "Регистрация успешна",
  "user": {
    "id": 1,
    "email": "flutter_test@example.com",
    "username": "FlutterTestUser"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Шаг 3: Тест входа

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "flutter_test@example.com",
    "password": "TestPassword123"
  }'
```

### Шаг 4: Тест защищённого эндпоинта

```bash
# Скопируйте токен из предыдущего ответа и вставьте сюда
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

curl -H "Authorization: Bearer %TOKEN%" \
  http://localhost:5000/api/auth/profile
```

---

## 📱 ИНТЕГРАЦИЯ В FLUTTER КОД

### 1. Обновите `lib/config/api_config.dart`

Найдите эту строку:
```dart
static const String DEV_API_URL = 'http://localhost:5000/api';
```

Если тестируете на реальном устройстве, используйте:
```dart
static const String DEV_API_URL = 'http://192.168.1.X:5000/api';
```

(Замените `192.168.1.X` на IP вашего компьютера)

### 2. Обновите `lib/services/api_service.dart`

```dart
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static const String baseUrl = ApiConfig.DEV_API_URL;
  // ... остальной код
}
```

### 3. Используйте в экранах

**Пример: `lib/screens/auth/login_screen.dart`**

```dart
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  void _login() async {
    try {
      final response = await ApiService.post('/auth/login', {
        'email': emailController.text,
        'password': passwordController.text,
      });

      // Сохранить токен
      ApiService.setToken(response['token']);

      // Перейти на главный экран
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ошибка: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // ... UI код
  }
}
```

---

## 🔧 ОБНОВИТЕ `pubspec.yaml`

Убедитесь, что есть эти зависимости:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP запросы
  http: ^1.1.0
  
  # (опционально) Для более удобных HTTP запросов
  dio: ^5.2.0

  # Для сохранения токена
  flutter_secure_storage: ^9.0.0

  # Для глобального состояния
  provider: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
```

Затем выполните:
```bash
flutter pub get
```

---

## 📊 ПОЛНЫЙ ЖИЗНЕННЫЙ ЦИКЛ ТЕСТИРОВАНИЯ

### 1. Запустить бэкенд (Terminal 1)
```bash
npm start
```

### 2. Запустить фронтенд (Terminal 2)
```bash
flutter run
```

### 3. В приложении (Flutter)
- ✅ Нажмите кнопку "Регистрация"
- ✅ Введите email, пароль, имя пользователя
- ✅ Нажмите "Зарегистрироваться"
- ✅ Если регистрация успешна, вы должны увидеть главный экран
- ✅ Нажмите кнопку "Ежедневный вход"
- ✅ Проверьте, что бонусы добавлены

### 4. Проверить логи в Terminal 1
```
📥 GET http://localhost:5000/api/auth/profile
📊 Статус: 200
✅ Успех!
```

---

## 🌐 ЗАПУСК НА РАЗНЫХ ПЛАТФОРМАХ

### Веб (Chrome) - Самый быстрый способ протестировать

```bash
flutter run -d chrome
```

### Android Эмулятор

```bash
flutter run -d emulator-5554
```

### iOS Симулятор (только на macOS)

```bash
flutter run -d simulator
```

### Windows Desktop

```bash
flutter run -d windows
```

### Реальное устройство

```bash
# Список устройств
flutter devices

# Запуск на устройстве
flutter run -d <device_id>
```

---

## 🔐 СОХРАНЕНИЕ ТОКЕНА (Рекомендуется)

Создайте файл `lib/services/secure_storage.dart`:

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

Используйте при входе:
```dart
final token = response['token'];
ApiService.setToken(token);
await SecureStorage.saveToken(token);
```

При запуске приложения:
```dart
void main() async {
  final token = await SecureStorage.getToken();
  if (token != null) {
    ApiService.setToken(token);
    // Автоматически переходим на главный экран
  }
  runApp(MyApp());
}
```

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

| Проблема | Решение |
|----------|---------|
| "Connection refused" | Проверьте `npm start` в Terminal 1 |
| "Network timeout" | Убедитесь, что используется правильный IP |
| "401 Unauthorized" | Токен истёк; переавторизуйтесь |
| "CORS error" | Проверьте CORS конфигурацию в `src/app.js` |
| "Port 5000 already in use" | Закройте другие приложения на этом порте или измените порт в `.env` |

---

## 📈 МОНИТОРИНГ ЗАПРОСОВ

Включите логирование в `lib/services/api_service.dart`:

```dart
static void _logRequest(String method, String endpoint, dynamic body) {
  print('═══════════════════════════════════════');
  print('📤 $method REQUEST');
  print('🔗 $endpoint');
  if (body != null) print('📋 Body: $body');
  print('═══════════════════════════════════════');
}
```

---

## ✅ Чеклист готовности

- [ ] Бэкенд запущен на port 5000
- [ ] Фронтенд запущен на localhost:3000 (или другой порт)
- [ ] API здоровье проверено (`/api/health`)
- [ ] Регистрация работает
- [ ] Вход работает  
- [ ] Токен сохраняется
- [ ] Запросы логируются в консоли
- [ ] Профиль загружается
- [ ] Квесты загружаются
- [ ] Можно купить товар в маркетплейсе

**Все готово к разработке! 🚀**

---

## 🎓 ОБУЧАЮЩИЕ ССЫЛКИ

- [Flutter Documentation](https://flutter.dev/docs)
- [HTTP пакет для Flutter](https://pub.dev/packages/http)
- [Secure Storage для Flutter](https://pub.dev/packages/flutter_secure_storage)
- [Express.js API Documentation](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
