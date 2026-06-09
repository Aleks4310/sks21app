import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/// Провайдер состояния приложения.
///
/// Работает поверх реального бэкенда (SKS Quest API):
///   • геттеры (currentUser, quests, prizes, leaderboard, …) — синхронный кэш,
///     который заполняется из API после входа и после каждого действия;
///   • действия (login, performDailyCheckIn, completeQuest, …) — асинхронные,
///     ходят на сервер и обновляют кэш.
class AppProvider extends ChangeNotifier {
  // ── Демо-аккаунты под каждую роль (вход «в один тап») ──────────────────────
  static const Map<UserRole, Map<String, String>> _demoAccounts = {
    UserRole.client: {'email': 'user1@test.com', 'password': 'password123'},
    UserRole.marketing: {'email': 'marketing@test.com', 'password': 'password123'},
    UserRole.admin: {'email': 'admin@test.com', 'password': 'password123'},
    // Отдельного demo-аккаунта аналитика в сидах нет — используем admin (видит дашборды).
    UserRole.marketingAnalyst: {'email': 'admin@test.com', 'password': 'password123'},
  };

  // ── Current user ──────────────────────────────────────────────────────────
  User? _currentUser;
  User? get currentUser => _currentUser;

  String? _lastError;
  String? get lastError => _lastError;

  // ── Wheel spin state (UI-гейтинг; реальное начисление — на сервере) ────────
  int _weeklySpinsUsed = 0;
  int _bonusSpinsUsed = 0;
  DateTime? _bonusSpinsDate;
  static const int maxDailyBonusSpins = 2;

  int get weeklySpinsUsed => _weeklySpinsUsed;
  int get bonusSpinsUsed {
    _ensureDailyBonusSpinState();
    return _bonusSpinsUsed;
  }

  bool get hasFreeWeeklySpin => _weeklySpinsUsed < 1;
  bool get canBonusSpin {
    _ensureDailyBonusSpinState();
    return _bonusSpinsUsed < maxDailyBonusSpins;
  }

  int get bonusSpinsRemaining {
    _ensureDailyBonusSpinState();
    return maxDailyBonusSpins - _bonusSpinsUsed;
  }

  // ── Data caches ────────────────────────────────────────────────────────────
  List<Quest> _quests = [];
  List<Quest> get quests => _quests;

  List<Achievement> _achievements = [];
  List<Achievement> get achievements => _achievements;

  List<MarketplacePrize> _prizes = [];
  List<MarketplacePrize> get prizes => _prizes;

  List<LeaderboardEntry> _leaderboard = [];
  List<LeaderboardEntry> get leaderboard => _leaderboard;

  List<BonusTransaction> _transactions = [];
  List<BonusTransaction> get transactions => _transactions;

  AnalyticsData? _analytics;
  AnalyticsData? get analytics => _analytics;

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────────────────────

  Future<bool> login(String phone, UserRole role) async {
    _lastError = null;
    final creds = _demoAccounts[role]!;
    try {
      final res = await ApiService.post('/auth/login', creds);
      ApiService.setToken(res['token']?.toString());
      await _loadProfile(phone, role);
      await _loadAll();
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _lastError = e.message;
      return false;
    } catch (_) {
      _lastError = 'Нет связи с сервером. Запущен ли бэкенд?';
      return false;
    }
  }

  void logout() {
    ApiService.clearToken();
    _currentUser = null;
    _quests = [];
    _achievements = [];
    _prizes = [];
    _leaderboard = [];
    _transactions = [];
    _analytics = null;
    _weeklySpinsUsed = 0;
    _bonusSpinsUsed = 0;
    notifyListeners();
  }

  Future<void> _loadProfile(String phone, UserRole role) async {
    final me = await ApiService.get('/auth/me');
    final balanceRes = await ApiService.get('/bonus/balance');
    final balance = _toInt(balanceRes['balance']);
    final earned = _toInt(me['total_bonus_earned']);

    int leaguePoints = 0;
    try {
      final myRank = await ApiService.get('/leaderboard/my-rank');
      leaguePoints = _toInt(myRank['monthly_bonus']);
    } catch (_) {/* у роли может не быть позиции */}

    _currentUser = User(
      id: '${me['id']}',
      name: (me['username'] ?? me['pseudo_name'] ?? _nameForRole(role)).toString(),
      phone: phone,
      role: role,
      bonusBalance: balance,
      totalBonusEarned: earned,
      loyaltyStatus: _loyaltyFromEarned(earned),
      statusProgress: _statusProgressFromEarned(earned),
      streak: _toInt(me['streak_days']),
      league: _leagueFromPoints(leaguePoints),
      leaguePoints: leaguePoints,
      avatar: _avatarForRole(role),
      badgeIds: const [],
    );
  }

  Future<void> _loadAll() async {
    await Future.wait([
      _loadQuests(),
      _loadAchievements(),
      _loadPrizes(),
      _loadLeaderboard(),
      _loadTransactions(),
      if (_currentUser?.role != UserRole.client) _loadAnalytics(),
    ]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATA LOADERS (API → модели). Каждый изолирован, чтобы сбой одного
  // не ломал остальные разделы.
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _loadQuests() async {
    try {
      final list = await ApiService.get('/quests') as List;
      _quests = list.map<Quest>((j) {
        final seasonal = j['is_seasonal'] == true;
        return Quest(
          id: '${j['id']}',
          title: (j['title'] ?? '').toString(),
          description: (j['description'] ?? '').toString(),
          rewardBonus: _toInt(j['bonus_reward']),
          type: seasonal ? QuestType.seasonal : QuestType.daily,
          icon: _questIcon((j['title'] ?? '').toString()),
          expiresAt: _parseDate(j['end_date']),
          progressTotal: 1,
        );
      }).toList();
    } catch (_) {/* keep cache */}
  }

  Future<void> _loadAchievements() async {
    try {
      final list = await ApiService.get('/achievements/my') as List;
      _achievements = list.map<Achievement>((j) {
        return Achievement(
          id: '${j['id']}',
          title: (j['name'] ?? '').toString(),
          description: (j['description'] ?? '').toString(),
          emoji: _achEmoji(j['requirement_type']?.toString()),
          isRare: _toInt(j['bonus_reward']) >= 500,
          isUnlocked: j['earned_at'] != null,
          unlockedAt: _parseDate(j['earned_at']),
        );
      }).toList();
    } catch (_) {}
  }

  Future<void> _loadPrizes() async {
    try {
      final list = await ApiService.get('/marketplace') as List;
      _prizes = list.map<MarketplacePrize>((j) {
        final hasStock = j['stock_limit'] != null;
        return MarketplacePrize(
          id: '${j['id']}',
          title: (j['name'] ?? '').toString(),
          description: (j['description'] ?? '').toString(),
          bonusCost: _toInt(j['price_bonus']),
          category: _prizeCategory(j['category']?.toString()),
          emoji: _prizeEmoji(j['category']?.toString()),
          remainingCount: hasStock ? _toInt(j['remaining']) : null,
        );
      }).toList();
    } catch (_) {}
  }

  Future<void> _loadLeaderboard() async {
    try {
      final list = await ApiService.get('/leaderboard') as List;
      _leaderboard = list.map<LeaderboardEntry>((j) {
        final rank = _toInt(j['rank']);
        final points = _toInt(j['monthly_bonus']);
        final avatar = (j['avatar'] ?? '').toString();
        return LeaderboardEntry(
          rank: rank,
          avatar: avatar.isNotEmpty ? avatar : _avatarForRank(rank),
          pseudonym: (j['pseudo_name'] ?? 'Гость').toString(),
          bonusPoints: points,
          league: _leagueFromPoints(points),
        );
      }).toList();
    } catch (_) {}
  }

  Future<void> _loadTransactions() async {
    try {
      final list = await ApiService.get('/bonus/history') as List;
      _transactions = list.map<BonusTransaction>(_mapTx).toList();
    } catch (_) {}
  }

  Future<void> _loadAnalytics() async {
    try {
      final stats = await ApiService.get('/analytics/stats');
      final daily = await ApiService.get('/analytics/daily?days=7') as List;

      final active = stats['active_users'] ?? {};
      final dau = _toInt(active['dau']);
      final mau = _toInt(active['mau']);
      final completion = stats['quest_completion'] ?? {};
      final distribution = (stats['bonus_distribution'] ?? []) as List;

      final mechanic = <String, int>{};
      for (final row in distribution) {
        mechanic[_sourceFromType(row['transaction_type']?.toString())] =
            _toInt(row['count']);
      }

      final weekly = daily.reversed.map<DailyStats>((j) {
        final date = _parseDate(j['date']) ?? DateTime.now();
        return DailyStats(
          day: _weekdayLabel(date),
          dau: _toInt(j['transactions']),
          questsCompleted: 0,
          bonusesAwarded: _toInt(j['bonuses_earned']),
        );
      }).toList();

      _analytics = AnalyticsData(
        dauMau: mau > 0 ? dau / mau : 0,
        totalUsers: mau,
        activeToday: dau,
        questCompletionRate: _parsePercent(completion['rate']),
        prizeRedemptionRate: 0,
        weeklyStats: weekly,
        mechanicEngagement: mechanic,
      );
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  Future<bool> performDailyCheckIn() async {
    if (_currentUser == null) return false;
    _lastError = null;
    try {
      final res = await ApiService.post('/checkin/daily');
      _currentUser!.streak = _toInt(res['streak']);
      _currentUser!.checkedInToday = true;
      _currentUser!.lastCheckIn = DateTime.now();
      await _refreshBalanceAndHistory();
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _lastError = e.message;
      if (e.statusCode == 400) {
        // уже отмечался сегодня
        _currentUser!.checkedInToday = true;
        notifyListeners();
      }
      return false;
    } catch (_) {
      _lastError = 'Нет связи с сервером';
      return false;
    }
  }

  Future<bool> completeQuest(String questId) async {
    _lastError = null;
    try {
      await ApiService.post('/quests/$questId/complete');
      final idx = _quests.indexWhere((q) => q.id == questId);
      if (idx != -1) {
        _quests[idx].status = QuestStatus.completed;
        _quests[idx].progressCurrent = _quests[idx].progressTotal;
      }
      await _refreshBalanceAndHistory();
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _lastError = e.message;
      return false;
    } catch (_) {
      _lastError = 'Нет связи с сервером';
      return false;
    }
  }

  Future<bool> purchasePrize(String prizeId) async {
    _lastError = null;
    try {
      await ApiService.post('/marketplace/$prizeId/purchase');
      final idx = _prizes.indexWhere((p) => p.id == prizeId);
      if (idx != -1) {
        _prizes[idx].isPurchased = true;
        final rc = _prizes[idx].remainingCount;
        if (rc != null) _prizes[idx].remainingCount = rc - 1;
      }
      await _refreshBalanceAndHistory();
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _lastError = e.message;
      return false;
    } catch (_) {
      _lastError = 'Нет связи с сервером';
      return false;
    }
  }

  /// Возвращает ИНДЕКС выигранного сектора (0-5) для анимации колеса,
  /// либо -1 при ошибке. Начисление бонуса делает сервер.
  Future<int> spinWheelIndex(bool isFree) async {
    _lastError = null;
    _ensureDailyBonusSpinState();
    try {
      final res = await ApiService.post('/wheel/spin');
      final reward = (res['reward'] ?? {}) as Map;
      if (isFree) {
        _weeklySpinsUsed++;
      } else {
        _bonusSpinsUsed++;
      }
      await _refreshBalanceAndHistory();
      notifyListeners();
      return _wheelIndexForReward(reward);
    } on ApiException catch (e) {
      _lastError = e.message;
      return -1;
    } catch (_) {
      _lastError = 'Нет связи с сервером';
      return -1;
    }
  }

  Future<void> createQuest({
    required String title,
    required String description,
    required int reward,
    required String icon,
  }) async {
    _lastError = null;
    try {
      await ApiService.post('/quests', {
        'title': title,
        'description': description,
        'bonus_reward': reward,
        'is_seasonal': true,
      });
      await _loadQuests();
      notifyListeners();
    } on ApiException catch (e) {
      _lastError = e.message;
    } catch (_) {
      _lastError = 'Нет связи с сервером';
    }
  }

  Future<void> _refreshBalanceAndHistory() async {
    try {
      final b = await ApiService.get('/bonus/balance');
      _currentUser!.bonusBalance = _toInt(b['balance']);
      final me = await ApiService.get('/auth/me');
      _currentUser!.totalBonusEarned = _toInt(me['total_bonus_earned']);
      _currentUser!.streak = _toInt(me['streak_days']);
      _currentUser!.loyaltyStatus = _loyaltyFromEarned(_currentUser!.totalBonusEarned);
      _currentUser!.statusProgress = _statusProgressFromEarned(_currentUser!.totalBonusEarned);
    } catch (_) {}
    await _loadTransactions();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  void _ensureDailyBonusSpinState() {
    final now = DateTime.now();
    if (_bonusSpinsDate == null || !_isSameDay(now, _bonusSpinsDate!)) {
      _bonusSpinsDate = now;
      _bonusSpinsUsed = 0;
    }
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  BonusTransaction _mapTx(dynamic j) => BonusTransaction(
        id: '${j['id']}',
        amount: _toInt(j['amount']),
        source: (j['description'] ?? _sourceFromType(j['transaction_type']?.toString()))
            .toString(),
        createdAt: _parseDate(j['created_at']) ?? DateTime.now(),
        expiresAt: _parseDate(j['expires_at']) ??
            DateTime.now().add(const Duration(days: 365)),
      );

  static int _toInt(dynamic v) {
    if (v == null) return 0;
    if (v is int) return v;
    if (v is double) return v.round();
    return int.tryParse(v.toString()) ?? 0;
  }

  static DateTime? _parseDate(dynamic v) =>
      v == null ? null : DateTime.tryParse(v.toString());

  static double _parsePercent(dynamic v) {
    if (v == null) return 0;
    final s = v.toString().replaceAll('%', '').trim();
    final d = double.tryParse(s) ?? 0;
    return d / 100.0;
  }

  // Сектора колеса в UI: [10, 25, 50, 100, 200, 500]
  int _wheelIndexForReward(Map reward) {
    if (reward['type'] == 'bonus') {
      const slices = [10, 25, 50, 100, 200, 500];
      final value = _toInt(reward['value']);
      int best = 0;
      int bestDiff = (slices[0] - value).abs();
      for (int i = 1; i < slices.length; i++) {
        final d = (slices[i] - value).abs();
        if (d < bestDiff) {
          bestDiff = d;
          best = i;
        }
      }
      return best;
    }
    return 0; // badge / discount — показываем нижний сектор
  }

  String _nameForRole(UserRole role) => switch (role) {
        UserRole.client => 'Клиент СКС',
        UserRole.marketing => 'Менеджер Маркетинга',
        UserRole.admin => 'Администратор',
        UserRole.marketingAnalyst => 'Аналитик',
      };

  String _avatarForRole(UserRole role) => switch (role) {
        UserRole.client => '🦊',
        UserRole.marketing => '📊',
        UserRole.admin => '🛡️',
        UserRole.marketingAnalyst => '📈',
      };

  String _avatarForRank(int rank) {
    const palette = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🐬', '🦋', '🦝', '🐨'];
    return palette[(rank - 1).clamp(0, palette.length - 1)];
  }

  LoyaltyStatus _loyaltyFromEarned(int earned) {
    if (earned >= 50000) return LoyaltyStatus.superVip;
    if (earned >= 20000) return LoyaltyStatus.vip;
    if (earned >= 7000) return LoyaltyStatus.premium;
    if (earned >= 1000) return LoyaltyStatus.regular;
    return LoyaltyStatus.standard;
  }

  int _statusProgressFromEarned(int earned) {
    // прогресс до следующего порога лояльности (0-100)
    const thresholds = [0, 1000, 7000, 20000, 50000];
    for (int i = 0; i < thresholds.length - 1; i++) {
      if (earned < thresholds[i + 1]) {
        final span = thresholds[i + 1] - thresholds[i];
        return (((earned - thresholds[i]) / span) * 100).round().clamp(0, 100);
      }
    }
    return 100;
  }

  String _leagueFromPoints(int points) {
    if (points >= 15000) return 'Diamond';
    if (points >= 7000) return 'Platinum';
    if (points >= 3000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  }

  PrizeCategory _prizeCategory(String? c) => switch (c) {
        'financial' => PrizeCategory.financial,
        'partner' => PrizeCategory.partner,
        'merch' => PrizeCategory.merch,
        'charity' => PrizeCategory.charity,
        'exclusive' => PrizeCategory.exclusive,
        _ => PrizeCategory.partner,
      };

  String _prizeEmoji(String? c) => switch (c) {
        'financial' => '💸',
        'partner' => '🛍️',
        'merch' => '👕',
        'charity' => '❤️',
        'exclusive' => '🎭',
        _ => '🎁',
      };

  String _achEmoji(String? type) => switch (type) {
        'streak_days' => '🔥',
        'total_bonus' => '💰',
        'quests_completed' => '🎯',
        'login_count' => '🥇',
        'referrals' => '🌟',
        _ => '🏅',
      };

  String _questIcon(String title) {
    final t = title.toLowerCase();
    if (t.contains('залог')) return '🔍';
    if (t.contains('золот') || t.contains('стат')) return '📖';
    if (t.contains('кальк')) return '🧮';
    if (t.contains('друг') || t.contains('приглас')) return '👥';
    if (t.contains('профил')) return '👤';
    return '🎯';
  }

  String _sourceFromType(String? type) => switch (type) {
        'checkin' => 'Ежедневный вход',
        'quest' => 'Квест',
        'wheel' => 'Колесо фортуны',
        'achievement' => 'Достижение',
        'spend' => 'Списание',
        'purchase' => 'Покупка',
        _ => type ?? 'Бонус',
      };

  String _weekdayLabel(DateTime d) {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days[(d.weekday - 1).clamp(0, 6)];
  }
}
