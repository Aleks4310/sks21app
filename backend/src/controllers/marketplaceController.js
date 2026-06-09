const pool = require('../config/database');
const BonusService = require('../services/bonusService');

const MarketplaceController = {
    // List items
    listItems: async (req, res) => {
        try {
            const { category } = req.query;
            
            let query = 'SELECT * FROM marketplace_items WHERE is_active = true';
            const params = [];
            
            if (category) {
                query += ' AND category = $1';
                params.push(category);
            }
            
            query += ' ORDER BY price_bonus ASC';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения товаров' });
        }
    },

    // Get item details
    getItem: async (req, res) => {
        try {
            const { itemId } = req.params;
            
            const result = await pool.query(
                'SELECT * FROM marketplace_items WHERE id = $1 AND is_active = true',
                [itemId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения товара' });
        }
    },

    // Purchase item
    purchaseItem: async (req, res) => {
        try {
            const { itemId } = req.params;
            const userId = req.userId;
            
            // Get item
            const item = await pool.query(
                'SELECT * FROM marketplace_items WHERE id = $1',
                [itemId]
            );
            
            if (item.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }
            
            const product = item.rows[0];
            
            // Check stock
            if (product.stock_limit && product.remaining <= 0) {
                return res.status(400).json({ error: 'Товар закончился' });
            }
            
            // Check balance
            const balance = await BonusService.getBalance(userId);
            if (balance < product.price_bonus) {
                const needed = product.price_bonus - balance;
                return res.status(400).json({ 
                    error: 'Недостаточно бонусов',
                    needed,
                    message: `До приза осталось ${needed} бонусов`
                });
            }
            
            // Spend bonuses
            await BonusService.spend(userId, product.price_bonus, `Покупка: ${product.name}`);
            
            // Record purchase
            const purchase = await pool.query(
                `INSERT INTO user_purchases (user_id, item_id, bonus_spent, status)
                 VALUES ($1, $2, $3, 'completed')
                 RETURNING *`,
                [userId, itemId, product.price_bonus]
            );
            
            // Update stock
            if (product.stock_limit) {
                await pool.query(
                    'UPDATE marketplace_items SET remaining = remaining - 1 WHERE id = $1',
                    [itemId]
                );
            }
            
            res.json({
                success: true,
                purchase: purchase.rows[0],
                message: `Покупка выполнена! Товар: ${product.name}`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка покупки' });
        }
    }
};

module.exports = MarketplaceController;
