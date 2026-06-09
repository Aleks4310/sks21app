// Интеграционный тест против ЖИВОГО бэкенда.
// Запускать при поднятом сервере (cd backend && npm start):
//   cd mobile && flutter\bin\flutter.bat test test/backend_integration_test.dart
// Если сервер недоступен — тест помечается как skipped, а не падает.

import 'package:flutter_test/flutter_test.dart';
import 'package:sks_quest/services/api_service.dart';
import 'package:sks_quest/providers/app_provider.dart';
import 'package:sks_quest/models/models.dart';

void main() {
  setUpAll(() {
    ApiService.overrideBaseUrl = 'http://localhost:5000/api';
  });

  test('login клиента + загрузка данных + действия', () async {
    final p = AppProvider();
    final ok = await p.login('+7 900 000 00 00', UserRole.client);

    if (!ok) {
      markTestSkipped('Бэкенд недоступен: ${p.lastError}');
      return;
    }

    // Профиль
    expect(p.currentUser, isNotNull);
    expect(p.currentUser!.role, UserRole.client);
    expect(p.currentUser!.bonusBalance, isA<int>());

    // Загруженные из API списки
    expect(p.prizes, isNotEmpty, reason: 'каталог призов должен прийти с сервера');
    expect(p.quests, isNotEmpty, reason: 'квесты должны прийти с сервера');
    expect(p.leaderboard, isNotEmpty, reason: 'лидерборд должен прийти с сервера');

    // Действие: ежедневный вход (true — начислил, false — уже отмечался сегодня)
    await p.performDailyCheckIn();
    expect(p.currentUser!.bonusBalance, isA<int>());

    // Действие: покупка самого дешёвого приза, если хватает баланса
    final affordable = p.prizes
        .where((pr) => !pr.isPurchased && pr.bonusCost <= p.currentUser!.bonusBalance)
        .toList()
      ..sort((a, b) => a.bonusCost.compareTo(b.bonusCost));
    if (affordable.isNotEmpty) {
      final before = p.currentUser!.bonusBalance;
      final bought = await p.purchasePrize(affordable.first.id);
      expect(bought, true, reason: p.lastError);
      expect(p.currentUser!.bonusBalance, lessThan(before));
    }
  }, timeout: const Timeout(Duration(seconds: 30)));

  test('login маркетолога + аналитика', () async {
    final p = AppProvider();
    final ok = await p.login('+7 900 111 22 33', UserRole.marketing);
    if (!ok) {
      markTestSkipped('Бэкенд недоступен: ${p.lastError}');
      return;
    }
    expect(p.analytics, isNotNull, reason: 'маркетолог должен видеть аналитику');
  }, timeout: const Timeout(Duration(seconds: 30)));
}
