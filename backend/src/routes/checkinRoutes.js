const express = require('express');
const router = express.Router();
const { dailyCheckin, buyStreakFreeze } = require('../controllers/checkinController');
const authMiddleware = require('../middleware/auth');

router.post('/daily', authMiddleware, dailyCheckin);
router.post('/freeze', authMiddleware, buyStreakFreeze);

module.exports = router;
