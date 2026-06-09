const pool = require('../config/database');
const LeaderboardService = require('../services/leaderboardService');

const LeaderboardController = {
    // Get monthly leaderboard
    getLeaderboard: async (req, res) => {
        try {
            const leaderboard = await LeaderboardService.getMonthlyLeaderboard();
            res.json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения лидерборда' });
        }
    },

    // Get user rank
    getUserRank: async (req, res) => {
        try {
            const userId = req.userId;
            const leaderboard = await LeaderboardService.getMonthlyLeaderboard(1000);
            
            const userRank = leaderboard.find(u => u.id === userId);
            if (!userRank) {
                return res.json({ rank: null, message: 'Вы пока не в лидерборде' });
            }
            
            res.json(userRank);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения рейтинга' });
        }
    },

    // Get user league
    getUserLeague: async (req, res) => {
        try {
            const userId = req.userId;
            const league = await LeaderboardService.getUserLeague(userId);
            
            res.json(league || { message: 'Лига не определена' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения лиги' });
        }
    }
};

module.exports = LeaderboardController;
