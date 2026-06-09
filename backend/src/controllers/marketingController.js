const pool = require('../config/database');

const MarketingController = {
    // Create marketing campaign
    createCampaign: async (req, res) => {
        try {
            const { title, description, start_date, end_date, bonus_reward, target_audience } = req.body;
            
            const result = await pool.query(
                `INSERT INTO quests (title, description, bonus_reward, is_seasonal, start_date, end_date, created_by, is_active)
                 VALUES ($1, $2, $3, true, $4, $5, $6, true)
                 RETURNING *`,
                [title, description, bonus_reward, start_date, end_date, req.userId]
            );
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка создания кампании' });
        }
    },

    // List campaigns
    listCampaigns: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM quests WHERE is_seasonal = true ORDER BY start_date DESC'
            );
            
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения кампаний' });
        }
    }
};

module.exports = MarketingController;
