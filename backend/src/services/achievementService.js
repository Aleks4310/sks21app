const pool = require('../config/database');

const AchievementService = {
    // Get user achievements
    getUserAchievements: async (userId) => {
        const result = await pool.query(
            `SELECT a.*, ua.earned_at FROM achievements a
             LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
             WHERE a.is_active = true
             ORDER BY a.id`,
            [userId]
        );
        
        return result.rows;
    },

    // Award achievement
    awardAchievement: async (userId, achievementId) => {
        const existing = await pool.query(
            `SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
            [userId, achievementId]
        );
        
        if (existing.rows.length > 0) {
            return null;
        }
        
        const result = await pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id) 
             VALUES ($1, $2) RETURNING *`,
            [userId, achievementId]
        );
        
        return result.rows[0];
    },

    // Get achievement by ID
    getAchievement: async (id) => {
        const result = await pool.query(
            'SELECT * FROM achievements WHERE id = $1',
            [id]
        );
        
        return result.rows[0] || null;
    },

    // List all achievements
    listAchievements: async () => {
        const result = await pool.query(
            'SELECT * FROM achievements WHERE is_active = true ORDER BY id'
        );
        
        return result.rows;
    }
};

module.exports = AchievementService;
