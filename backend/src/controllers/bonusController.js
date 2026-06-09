const BonusService = require('../services/bonusService');

const BonusController = {
    // Текущий баланс пользователя (сумма неистёкших бонусов)
    getBalance: async (req, res) => {
        try {
            const balance = await BonusService.getBalance(req.userId);
            res.json({ balance: parseInt(balance, 10) || 0 });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения баланса' });
        }
    },

    // История бонусных транзакций (для раздела «История»)
    getHistory: async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
            const history = await BonusService.getHistory(req.userId, limit);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка получения истории' });
        }
    },
};

module.exports = BonusController;
