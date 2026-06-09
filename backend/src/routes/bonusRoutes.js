const express = require('express');
const router = express.Router();
const BonusController = require('../controllers/bonusController');
const authMiddleware = require('../middleware/auth');

router.get('/balance', authMiddleware, BonusController.getBalance);
router.get('/history', authMiddleware, BonusController.getHistory);

module.exports = router;
