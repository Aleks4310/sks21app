import 'package:flutter_test/flutter_test.dart';

import 'package:sks_quest/main.dart';

void main() {
  testWidgets('Экран входа отображается', (WidgetTester tester) async {
    await tester.pumpWidget(const SKSQuestApp());
    await tester.pump(const Duration(milliseconds: 500));

    // На экране входа есть заголовок и кнопка получения кода.
    expect(find.text('SKS Quest'), findsWidgets);
    expect(find.text('Получить код'), findsOneWidget);
  });
}
