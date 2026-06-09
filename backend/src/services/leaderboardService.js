const pool = require('../config/database');

const LeaderboardService = {
    // Get monthly leaderboard
    getMonthlyLeaderboard: async (limit = 100) => {
        const result = await pool.query(
            `SELECT u.id, u.pseudo_name, u.avatar,
                    COALESCE(SUM(bt.amount), 0) as monthly_bonus
             FROM users u
             LEFT JOIN bonus_transactions bt ON u.id = bt.user_id 
                AND EXTRACT(YEAR FROM bt.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM bt.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND bt.amount > 0
             WHERE u.role = 'client'
             GROUP BY u.id, u.pseudo_name, u.avatar
             ORDER BY monthly_bonus DESC
             LIMIT $1`,
            [limit]
        );
        
        return result.rows.map((row, idx) => ({
            ...row,
            rank: idx + 1
        }));
    },

    // Update user leagues
    updateLeagues: async () => {
        const leagues = await pool.query('SELECT * FROM leagues ORDER BY rank_order ASC');
        const users = await pool.query(
            `SELECT u.id,
                    COALESCE(SUM(bt.amount), 0) as monthly_bonus
             FROM users u
             LEFT JOIN bonus_transactions bt ON u.id = bt.user_id
                AND EXTRACT(YEAR FROM bt.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM bt.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
             WHERE u.role = 'client'
             GROUP BY u.id`
        );
        
        for (const user of users.rows) {
            let league = null;
            for (const l of leagues.rows) {
                if (user.monthly_bonus >= l.min_bonus_month && user.monthly_bonus <= l.max_bonus_month) {
                    league = l;
                    break;
                }
            }
            
            if (league) {
                await pool.query(
                    `INSERT INTO user_league_history (user_id, league_id, month_year, bonus_earned_month)
                     VALUES ($1, $2, CURRENT_DATE, $3)
                     ON CONFLICT DO NOTHING`,
                    [user.id, league.id, user.monthly_bonus]
                );
            }
        }
    },

    // Get user league
    getUserLeague: async (userId) => {
        const result = await pool.query(
            `SELECT l.* FROM user_league_history ulh
             JOIN leagues l ON ulh.league_id = l.id
             WHERE ulh.user_id = $1 AND EXTRACT(MONTH FROM ulh.month_year) = EXTRACT(MONTH FROM CURRENT_DATE)
             LIMIT 1`,
            [userId]
        );
        
        return result.rows[0] || null;
    }
};

module.exports = LeaderboardService;
