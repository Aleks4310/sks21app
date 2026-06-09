const pool = require('../config/database');
const BonusService = require('../services/bonusService');

const QuestController = {
    // Get daily quests
    getDailyQuests: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT * FROM quests 
                 WHERE (is_seasonal = false OR (start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP))
                 AND is_active = true
                 ORDER BY RANDOM()
                 LIMIT 3`
            );
            
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения квестов' });
        }
    },

    // Get all quests (for marketing)
    getAllQuests: async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT * FROM quests WHERE is_active = true ORDER BY created_at DESC`
            );
            
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения квестов' });
        }
    },

    // Create quest (marketing only)
    createQuest: async (req, res) => {
        try {
            const { title, description, bonus_reward, is_seasonal, start_date, end_date } = req.body;
            
            const result = await pool.query(
                `INSERT INTO quests (title, description, bonus_reward, is_seasonal, start_date, end_date, created_by, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                 RETURNING *`,
                [title, description, bonus_reward, is_seasonal, start_date, end_date, req.userId]
            );
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка создания квеста' });
        }
    },

    // Complete quest
    completeQuest: async (req, res) => {
        try {
            const { questId } = req.params;
            
            // Get quest
            const quest = await pool.query('SELECT * FROM quests WHERE id = $1', [questId]);
            if (quest.rows.length === 0) {
                return res.status(404).json({ error: 'Квест не найден' });
            }
            
            // Check if user already completed today
            const today = new Date().toISOString().split('T')[0];
            const completed = await pool.query(
                `SELECT id FROM user_quest_progress 
                 WHERE user_id = $1 AND quest_id = $2 AND DATE(created_at) = $3`,
                [req.userId, questId, today]
            );
            
            if (completed.rows.length > 0) {
                return res.status(400).json({ error: 'Вы уже выполнили этот квест сегодня' });
            }
            
            // Award bonus
            await BonusService.add(req.userId, quest.rows[0].bonus_reward, 'quest', questId, `Квест: ${quest.rows[0].title}`);
            
            // Record completion
            await pool.query(
                `INSERT INTO user_quest_progress (user_id, quest_id, completed)
                 VALUES ($1, $2, true)`,
                [req.userId, questId]
            );
            
            // Check achievements
            await BonusService.checkAchievements(req.userId);
            
            res.json({
                success: true,
                bonus_earned: quest.rows[0].bonus_reward,
                message: `Квест выполнен! Вы получили ${quest.rows[0].bonus_reward} бонусов`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка выполнения квеста' });
        }
    }
};

module.exports = QuestController;
