const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stats', authMiddleware, roleCheck(['marketing', 'marketing_analyst', 'admin']), AnalyticsController.getStats);
router.get('/daily', authMiddleware, roleCheck(['marketing', 'marketing_analyst', 'admin']), AnalyticsController.getDailyStats);

module.exports = router;
