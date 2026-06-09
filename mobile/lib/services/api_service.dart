import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;

/// Ошибка от API с сообщением для пользователя.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
  @override
  String toString() => message;
}

/// Тонкий клиент REST API бэкенда SKS Quest.
///
/// Базовый адрес выбирается автоматически:
///   • web                → http://localhost:5000/api
///   • реальное устройство → IP этого ПК в Wi-Fi (см. ниже)
/// Можно переопределить при сборке/запуске:
///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api   (Android-эмулятор)
///   flutter build apk --dart-define=API_BASE_URL=http://192.168.1.219:5000/api
class ApiService {
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Программное переопределение адреса (используется в тестах).
  static String? overrideBaseUrl;

  static String get baseUrl {
    if (overrideBaseUrl != null) return overrideBaseUrl!;
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    if (kIsWeb) return 'http://localhost:5000/api';
    // IP вашего ПК в локальной сети (телефон должен быть в той же Wi-Fi).
    return 'http://192.168.1.219:5000/api';
  }

  static String? _token;
  static void setToken(String? token) => _token = token;
  static String? get token => _token;
  static void clearToken() => _token = null;

  static Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  static const Duration _timeout = Duration(seconds: 15);

  static Future<dynamic> get(String path) async {
    final res = await http
        .get(Uri.parse('$baseUrl$path'), headers: _headers())
        .timeout(_timeout);
    return _decode(res);
  }

  static Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .post(Uri.parse('$baseUrl$path'),
            headers: _headers(), body: jsonEncode(body ?? {}))
        .timeout(_timeout);
    return _decode(res);
  }

  static Future<dynamic> put(String path, [Map<String, dynamic>? body]) async {
    final res = await http
        .put(Uri.parse('$baseUrl$path'),
            headers: _headers(), body: jsonEncode(body ?? {}))
        .timeout(_timeout);
    return _decode(res);
  }

  static dynamic _decode(http.Response res) {
    dynamic data;
    if (res.body.isNotEmpty) {
      try {
        data = jsonDecode(utf8.decode(res.bodyBytes));
      } catch (_) {
        data = null;
      }
    }
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return data;
    }
    final msg = (data is Map && data['error'] != null)
        ? data['error'].toString()
        : 'Ошибка сервера (${res.statusCode})';
    throw ApiException(res.statusCode, msg);
  }
}
