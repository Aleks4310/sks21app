const pool = require('../config/database');
const AnalyticsService = require('../services/analyticsService');
const roleCheck = require('../middleware/roleCheck');

const AnalyticsController = {
    // Get overview stats
    getStats: async (req, res) => {
        try {
            const activeUsers = await AnalyticsService.getActiveUsers();
            const completion = await AnalyticsService.getQuestCompletionRate();
            const distribution = await AnalyticsService.getBonusDistribution();
            
            res.json({
                active_users: activeUsers,
                quest_completion: completion,
                bonus_distribution: distribution
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения статистики' });
        }
    },

    // Get daily stats
    getDailyStats: async (req, res) => {
        try {
            const { days = 30 } = req.query;
            const stats = await AnalyticsService.getDailyStats(days);
            
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения ежедневной статистики' });
        }
    }
};

module.exports = AnalyticsController;
