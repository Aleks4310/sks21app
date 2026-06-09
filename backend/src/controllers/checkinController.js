const pool = require('../config/database');
const BonusService = require('../services/bonusService');

const dailyCheckin = async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date().toISOString().split('T')[0];
        
        const user = await pool.query(
            `SELECT last_checkin_date::text AS last_checkin_date, streak_days, streak_freeze_until FROM users WHERE id = $1`,
            [userId]
        );
        
        const lastDate = user.rows[0].last_checkin_date;
        let currentStreak = user.rows[0].streak_days || 0;
        const freezeUntil = user.rows[0].streak_freeze_until;
        
        if (lastDate === today) {
            return res.status(400).json({ error: 'Вы уже получали бонус сегодня' });
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = currentStreak;
        let bonusReward = 5;
        
        if (lastDate === yesterdayStr) {
            newStreak += 1;
        } else {
            // Проверка заморозки
            if (freezeUntil && new Date(freezeUntil) >= new Date()) {
                newStreak = currentStreak;
            } else {
                newStreak = 1;
            }
        }
        
        // Бонусы за серию
        if (newStreak === 7) bonusReward += 50;
        if (newStreak === 14) bonusReward += 150;
        if (newStreak === 30) bonusReward += 500;
        
        // Начисляем бонусы
        await BonusService.add(userId, bonusReward, 'checkin', null, `Ежедневный вход: день ${newStreak}`);
        
        // Обновляем streak
        await pool.query(
            `UPDATE users SET streak_days = $1, last_checkin_date = $2 WHERE id = $3`,
            [newStreak, today, userId]
        );
        
        // Проверяем достижения
        await BonusService.checkAchievements(userId);
        
        res.json({
            success: true,
            streak: newStreak,
            bonus_earned: bonusReward,
            message: `Вы получили ${bonusReward} бонусов! Серия: ${newStreak} дней`
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении бонуса' });
    }
};

const buyStreakFreeze = async (req, res) => {
    try {
        const userId = req.userId;
        const freezeUntil = new Date();
        freezeUntil.setDate(freezeUntil.getDate() + 7);
        
        // Списываем 100 бонусов
        await BonusService.spend(userId, 100, 'Покупка заморозки серии');
        
        await pool.query(
            `UPDATE users SET streak_freeze_until = $1 WHERE id = $2`,
            [freezeUntil, userId]
        );
        
        res.json({
            success: true,
            message: 'Заморозка серии активирована на 7 дней'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message || 'Ошибка покупки заморозки' });
    }
};

module.exports = { dailyCheckin, buyStreakFreeze };