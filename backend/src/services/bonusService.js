const pool = require('../config/database');

const BonusService = {
    // Add bonuses to user
    add: async (userId, amount, type, sourceId, description) => {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        const result = await pool.query(
            `INSERT INTO bonus_transactions (user_id, amount, transaction_type, source_id, description, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, amount, type, sourceId, description, expiresAt]
        );
        
        // Update user total
        await pool.query(
            'UPDATE users SET total_bonus_earned = total_bonus_earned + $1 WHERE id = $2',
            [amount, userId]
        );
        
        return result.rows[0];
    },

    // Spend bonuses
    spend: async (userId, amount, reason) => {
        const user = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [userId]
        );
        
        if (user.rows.length === 0) {
            throw new Error('Пользователь не найден');
        }
        
        // Get non-expired bonuses (oldest first - FIFO)
        const bonuses = await pool.query(
            `SELECT * FROM bonus_transactions 
             WHERE user_id = $1 AND amount > 0 AND expires_at > CURRENT_DATE
             ORDER BY created_at ASC`,
            [userId]
        );
        
        let remaining = amount;
        const transactions = [];
        
        for (const bonus of bonuses.rows) {
            if (remaining <= 0) break;
            
            const toSpend = Math.min(bonus.amount, remaining);
            
            // Create spend transaction
            const spendTx = await pool.query(
                `INSERT INTO bonus_transactions (user_id, amount, transaction_type, source_id, description)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [userId, -toSpend, 'spend', bonus.id, reason]
            );
            
            // Update original transaction
            await pool.query(
                'UPDATE bonus_transactions SET amount = amount - $1 WHERE id = $2',
                [toSpend, bonus.id]
            );
            
            transactions.push(spendTx.rows[0]);
            remaining -= toSpend;
        }
        
        if (remaining > 0) {
            throw new Error('Недостаточно бонусов');
        }
        
        // Update user total
        await pool.query(
            'UPDATE users SET total_bonus_spent = total_bonus_spent + $1 WHERE id = $2',
            [amount, userId]
        );
        
        return transactions;
    },

    // Get user balance
    getBalance: async (userId) => {
        const result = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as balance 
             FROM bonus_transactions 
             WHERE user_id = $1 AND expires_at > CURRENT_DATE`,
            [userId]
        );
        
        return result.rows[0].balance;
    },

    // Get transaction history (newest first)
    getHistory: async (userId, limit = 50) => {
        const result = await pool.query(
            `SELECT id, amount, transaction_type, description, created_at, expires_at
             FROM bonus_transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );

        return result.rows;
    },

    // Check and award achievements
    checkAchievements: async (userId) => {
        const user = await pool.query(
            `SELECT total_bonus_earned, streak_days FROM users WHERE id = $1`,
            [userId]
        );
        
        if (user.rows.length === 0) return;
        
        const userData = user.rows[0];
        
        // Check achievement conditions
        const achievements = await pool.query(
            `SELECT * FROM achievements WHERE is_active = true`
        );
        
        for (const achievement of achievements.rows) {
            let qualified = false;
            
            switch (achievement.requirement_type) {
                case 'total_bonus':
                    qualified = userData.total_bonus_earned >= achievement.requirement_value;
                    break;
                case 'streak_days':
                    qualified = userData.streak_days >= achievement.requirement_value;
                    break;
            }
            
            if (qualified) {
                // Check if already awarded
                const existing = await pool.query(
                    `SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2`,
                    [userId, achievement.id]
                );
                
                if (existing.rows.length === 0) {
                    // Award achievement
                    await pool.query(
                        `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)`,
                        [userId, achievement.id]
                    );
                    
                    // Add bonus reward
                    if (achievement.bonus_reward > 0) {
                        await BonusService.add(userId, achievement.bonus_reward, 'achievement', achievement.id,
                                     `Достижение: ${achievement.name}`);
                    }
                }
            }
        }
    }
};

module.exports = BonusService;
