const pool = require('../config/database');

const ExpirationService = {
    // Check expiring bonuses
    checkExpiringBonuses: async (userId) => {
        const thirtyDaysFrom = new Date();
        thirtyDaysFrom.setDate(thirtyDaysFrom.getDate() + 30);
        
        const result = await pool.query(
            `SELECT * FROM bonus_transactions
             WHERE user_id = $1 AND amount > 0 AND expires_at <= $2 AND expires_at > CURRENT_DATE`,
            [userId, thirtyDaysFrom]
        );
        
        return result.rows;
    },

    // Cleanup expired bonuses
    cleanupExpiredBonuses: async () => {
        const result = await pool.query(
            `UPDATE bonus_transactions SET amount = 0 
             WHERE amount > 0 AND expires_at <= CURRENT_DATE`
        );
        
        return result.rowCount;
    }
};

module.exports = ExpirationService;
