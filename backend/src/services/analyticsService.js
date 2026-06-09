const pool = require('../config/database');

const AnalyticsService = {
    // Get DAU/MAU
    getActiveUsers: async () => {
        const dau = await pool.query(
            `SELECT COUNT(DISTINCT user_id) as count FROM bonus_transactions 
             WHERE created_at >= CURRENT_DATE`
        );
        
        const mau = await pool.query(
            `SELECT COUNT(DISTINCT user_id) as count FROM bonus_transactions 
             WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`
        );
        
        return {
            dau: parseInt(dau.rows[0].count),
            mau: parseInt(mau.rows[0].count),
            ratio: mau.rows[0].count > 0 ? (dau.rows[0].count / mau.rows[0].count * 100).toFixed(2) + '%' : '0%'
        };
    },

    // Get quest completion rate
    getQuestCompletionRate: async () => {
        const result = await pool.query(
            `SELECT 
                COUNT(DISTINCT user_id) as users_with_quests,
                COUNT(DISTINCT CASE WHEN completed = true THEN user_id END) as users_completed
             FROM user_quest_progress WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`
        );
        
        const row = result.rows[0];
        return {
            total_users: row.users_with_quests,
            completed_users: row.users_completed,
            rate: row.users_with_quests > 0 ? (row.users_completed / row.users_with_quests * 100).toFixed(2) + '%' : '0%'
        };
    },

    // Get bonus distribution
    getBonusDistribution: async () => {
        const result = await pool.query(
            `SELECT transaction_type, COUNT(*) as count, SUM(ABS(amount)) as total
             FROM bonus_transactions
             WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
             GROUP BY transaction_type
             ORDER BY total DESC`
        );
        
        return result.rows;
    },

    // Get daily stats
    getDailyStats: async (days = 30) => {
        const result = await pool.query(
            `SELECT DATE(created_at) as date, COUNT(*) as transactions, SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as bonuses_earned
             FROM bonus_transactions
             WHERE created_at >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
             GROUP BY DATE(created_at)
             ORDER BY date DESC`,
            [parseInt(days, 10) || 30]
        );
        
        return result.rows;
    }
};

module.exports = AnalyticsService;
