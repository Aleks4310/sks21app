const pool = require('../config/database');
const BonusService = require('../services/bonusService');

const WheelController = {
    // Spin the wheel
    spinWheel: async (req, res) => {
        try {
            const userId = req.userId;
            const today = new Date().toISOString().split('T')[0];
            
            // Check free spins
            const spinsToday = await pool.query(
                `SELECT COUNT(*) as count FROM wheel_spins 
                 WHERE user_id = $1 AND DATE(created_at) = $2`,
                [userId, today]
            );
            
            const spinCount = parseInt(spinsToday.rows[0].count);
            const isFree = spinCount === 0;
            
            if (!isFree && spinCount >= 5) {
                return res.status(400).json({ error: 'Превышен лимит прокруток (макс 5 в день)' });
            }
            
            // Check bonuses for paid spin
            if (!isFree) {
                const balance = await BonusService.getBalance(userId);
                if (balance < 50) {
                    return res.status(400).json({ error: 'Недостаточно бонусов для платной прокрутки' });
                }
                
                // Spend bonuses
                await BonusService.spend(userId, 50, 'wheel_spin');
            }
            
            // Calculate reward (weighted probabilities)
            const rewards = [
                { type: 'bonus', value: 10, probability: 0.30 },
                { type: 'bonus', value: 50, probability: 0.25 },
                { type: 'bonus', value: 100, probability: 0.15 },
                { type: 'bonus', value: 500, probability: 0.10 },
                { type: 'badge', value: 'lucky', probability: 0.15 },
                { type: 'discount', value: 10, probability: 0.05 }
            ];
            
            const random = Math.random();
            let cumulativeProbability = 0;
            let reward = rewards[0];
            
            for (const r of rewards) {
                cumulativeProbability += r.probability;
                if (random <= cumulativeProbability) {
                    reward = r;
                    break;
                }
            }
            
            // Apply reward
            if (reward.type === 'bonus') {
                await BonusService.add(userId, reward.value, 'wheel', null, 'Колесо фортуны');
            } else if (reward.type === 'badge') {
                // Award achievement/badge
            } else if (reward.type === 'discount') {
                // Record discount
            }
            
            // Record spin
            await pool.query(
                `INSERT INTO wheel_spins (user_id, spin_type, reward_type, reward_value)
                 VALUES ($1, $2, $3, $4)`,
                [userId, isFree ? 'free' : 'paid', reward.type, reward.value]
            );
            
            res.json({
                success: true,
                reward,
                message: 'Спин выполнен!'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка прокрутки колеса' });
        }
    }
};

module.exports = WheelController;
