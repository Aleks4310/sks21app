const pool = require('../config/database');
const AchievementService = require('../services/achievementService');

const AchievementController = {
    // Get user achievements
    getUserAchievements: async (req, res) => {
        try {
            const userId = req.userId;
            const achievements = await AchievementService.getUserAchievements(userId);
            
            res.json(achievements);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения достижений' });
        }
    },

    // Get all achievements
    getAllAchievements: async (req, res) => {
        try {
            const achievements = await AchievementService.listAchievements();
            res.json(achievements);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения достижений' });
        }
    }
};

module.exports = AchievementController;
