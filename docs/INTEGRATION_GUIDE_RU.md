# 🔗 ИНТЕГРАЦИЯ ФРОНТЕНДА И БЭКЕНДА - SKS QUEST

## 📋 Обзор

Это руководство объясняет, как объединить **Flutter фронтенд** с **Node.js/Express бэкендом** для приложения "СКС Ломбард".

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   Flutter Mobile App                     │
│              (Android, iOS, Web, Desktop)                │
│                                                          │
│  - UI слой (Screens, Widgets)                           │
│  - State Management (Provider)                          │
│  - API Client (http, dio)                               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP/HTTPS
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Node.js Express Backend                     │
│         (API Server on http://localhost:5000)            │
│                                                          │
│  - Controllers (логика обработки)                       │
│  - Services (бизнес-логика)                             │
│  - Routes (API эндпоинты)                               │
│  - Middleware (проверка и валидация)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ SQL
                      │
┌─────────────────────▼───────────────────────────────────┐
│           PostgreSQL Database                            │
│        (11 таблиц с игровыми данными)                  │
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ БЫСТРЫЙ СТАРТ

### Шаг 1: Запуск бэкенда

```bash
# В одном терминале
cd c:\Users\aleks\Desktop\gamepr
npm start

# Сервер будет на http://localhost:5000
```

### Шаг 2: Настройка фронтенда

Отредактируйте `lib/providers/app_provider.dart` или создайте `lib/config/api_config.dart`:

```dart
const String API_BASE_URL = 'http://localhost:5000/api';
// или для реального устройства
// const String API_BASE_URL = 'http://192.168.1.X:5000/api';
```

### Шаг 3: Запуск фронтенда

```bash
# В другом терминале
cd c:\Users\aleks\Desktop\gamepr
flutter pub get
flutter run
```

---

## 🔧 НАСТРОЙКА API КЛИЕНТА

### Вариант 1: Использование пакета `http`

**Файл: `lib/services/api_service.dart`**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  static String? _token;

  static void setToken(String token) {
    _token = token;
  }

  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Ошибка: ${response.statusCode}');
    }
  }

  static Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Ошибка: ${response.statusCode}');
    }
  }
}
```

### Вариант 2: Использование пакета `dio`

**Файл: `lib/services/dio_service.dart`**

```dart
import 'package:dio/dio.dart';

class DioService {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:5000/api',
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
    ),
  );

  static void setToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.post(endpoint, data: data);
      return response.data;
    } on DioException catch (e) {
      throw Exception('Ошибка: ${e.message}');
    }
  }

  static Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await _dio.get(endpoint);
      return response.data;
    } on DioException catch (e) {
      throw Exception('Ошибка: ${e.message}');
    }
  }
}
```

---

## 📱 ИНТЕГРАЦИЯ В FLUTTER КОМПОНЕНТЫ

### 1. Регистрация/Вход

**Файл: `lib/screens/auth/login_screen.dart`**

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isLoading = false;

  void _login() async {
    setState(() => isLoading = true);

    try {
      final response = await ApiService.post('/auth/login', {
        'email': emailController.text,
        'password': passwordController.text,
      });

      final token = response['token'];
      ApiService.setToken(token);

      // Сохранить токен в secure storage
      // await FlutterSecureStorage().write(
      //   key: 'auth_token',
      //   value: token,
      // );

      // Перейти на главный экран
      Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ошибка входа: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Вход в приложение')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            SizedBox(height: 16),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(labelText: 'Пароль'),
              obscureText: true,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: isLoading ? null : _login,
              child: isLoading
                  ? CircularProgressIndicator()
                  : Text('Войти'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2. Ежедневный вход

**Файл: `lib/screens/home/daily_checkin.dart`**

```dart
class DailyCheckinWidget extends StatefulWidget {
  @override
  State<DailyCheckinWidget> createState() => _DailyCheckinWidgetState();
}

class _DailyCheckinWidgetState extends State<DailyCheckinWidget> {
  bool isLoading = false;

  void _performCheckin() async {
    setState(() => isLoading = true);

    try {
      final response = await ApiService.post('/checkin/daily', {});

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ ${response['message']}'),
          backgroundColor: Colors.green,
        ),
      );

      // Обновить UI с новыми данными
      setState(() {});
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Ошибка: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Ежедневный вход'),
            SizedBox(height: 12),
            ElevatedButton(
              onPressed: isLoading ? null : _performCheckin,
              child: isLoading
                  ? CircularProgressIndicator()
                  : Text('Получить бонусы'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 3. Квесты

**Файл: `lib/screens/quests/quests_screen.dart`**

```dart
class QuestsScreen extends StatefulWidget {
  @override
  State<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends State<QuestsScreen> {
  late Future<List<Quest>> futureQuests;

  @override
  void initState() {
    super.initState();
    futureQuests = _fetchQuests();
  }

  Future<List<Quest>> _fetchQuests() async {
    final data = await ApiService.get('/quests/daily');
    return (data as List)
        .map((q) => Quest.fromJson(q))
        .toList();
  }

  Future<void> _completeQuest(int questId) async {
    try {
      final response = await ApiService.post(
        '/quests/$questId/complete',
        {},
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('✅ ${response['message']}')),
      );

      // Обновить список квестов
      setState(() {
        futureQuests = _fetchQuests();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Ошибка: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Квесты')),
      body: FutureBuilder<List<Quest>>(
        future: futureQuests,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Ошибка: ${snapshot.error}'));
          }

          final quests = snapshot.data ?? [];

          return ListView.builder(
            itemCount: quests.length,
            itemBuilder: (context, index) {
              final quest = quests[index];
              return Card(
                margin: EdgeInsets.all(8),
                child: ListTile(
                  title: Text(quest.title),
                  subtitle: Text(quest.description),
                  trailing: Text('${quest.bonusReward} бонусов'),
                  onTap: () => _completeQuest(quest.id),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class Quest {
  int id;
  String title;
  String description;
  int bonusReward;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.bonusReward,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      bonusReward: json['bonus_reward'],
    );
  }
}
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Сохранение токена

**Файл: `lib/services/secure_storage.dart`**

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

**Обновите `pubspec.yaml`:**

```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
  http: ^1.1.0
  # или
  dio: ^5.2.0
  provider: ^6.0.0
```

---

## 📦 ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Для разных окружений

**Файл: `lib/config/environment.dart`**

```dart
class Environment {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:5000/api',
  );

  static const String apiTimeout = String.fromEnvironment(
    'API_TIMEOUT',
    defaultValue: '10',
  );
}
```

**Запуск с переменными:**

```bash
flutter run -d chrome \
  --dart-define=API_URL=http://192.168.1.100:5000/api \
  --dart-define=API_TIMEOUT=15
```

---

## 🚀 ПОЛНЫЙ ЦИКЛ РАЗРАБОТКИ

### Терминал 1: Бэкенд

```bash
cd c:\Users\aleks\Desktop\gamepr
npm start
# Запустится на http://localhost:5000
```

### Терминал 2: Фронтенд

```bash
cd c:\Users\aleks\Desktop\gamepr
flutter run
```

### Для тестирования на реальном устройстве

1. Измените API URL на IP адрес вашего компьютера:
```dart
const String API_BASE_URL = 'http://192.168.X.X:5000/api';
```

2. Убедитесь, что устройство в одной сети с компьютером

3. Запустите фронтенд:
```bash
flutter run -d <device_id>
```

---

## 🧪 ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ

### 1. Проверить эндпоинт здоровья

```bash
curl http://localhost:5000/api/health
```

### 2. Тест регистрации

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fluttertest@example.com",
    "password": "password123",
    "username": "FlutterUser"
  }'
```

### 3. Тест получения квестов

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/quests/daily
```

---

## 📊 СТРУКТУРА ПРОЕКТА

```
gamepr/
├── backend/              # Или src/ (Node.js/Express)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── lib/                  # Flutter фронтенд
│   ├── main.dart
│   ├── config/
│   │   └── api_config.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   └── secure_storage.dart
│   ├── screens/
│   ├── widgets/
│   ├── models/
│   └── providers/
│
├── android/
├── ios/
├── pubspec.yaml
└── README.md
```

---

## 🔄 CI/CD ИНТЕГРАЦИЯ (опционально)

### GitHub Actions для автоматического тестирования

**Файл: `.github/workflows/test.yml`**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm install
      - run: npm test

  flutter-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test
      - run: flutter analyze
```

---

## 🐛 РЕШЕНИЕ РАСПРОСТРАНЁННЫХ ПРОБЛЕМ

### Проблема: "Connection refused"
**Решение:**
- Проверьте, что бэкенд запущен на порту 5000
- Используйте правильный IP (localhost для эмулятора, IP компьютера для устройства)

### Проблема: "CORS ошибка"
**Решение:**
- Бэкенд уже настроен с CORS
- Убедитесь, что используется правильный базовый URL

### Проблема: "Токен истёк"
**Решение:**
- Сохраняйте токен в secure storage
- Реализуйте автоматическое обновление токена
- Перенаправляйте на экран входа при 401 ошибке

### Проблема: "Медленная загрузка"
**Решение:**
- Добавьте кеширование (например, с помощью Hive)
- Оптимизируйте запросы на бэкенде
- Используйте пагинацию для больших списков

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- [Flutter Official Docs](https://flutter.dev/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [HTTP пакет для Flutter](https://pub.dev/packages/http)
- [Dio пакет для Flutter](https://pub.dev/packages/dio)

---

## ✅ Чеклист интеграции

- [ ] Бэкенд запущен на http://localhost:5000
- [ ] Фронтенд подключен к правильному API URL
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Квесты загружаются
- [ ] Ежедневный вход работает
- [ ] Маркетплейс загружается
- [ ] Лидерборд видимый
- [ ] Токен сохраняется в secure storage
- [ ] Тестировано на эмуляторе
- [ ] Тестировано на реальном устройстве

---

**Готово к разработке! Успехов! 🚀**
