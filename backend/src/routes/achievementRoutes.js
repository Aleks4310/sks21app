const express = require('express');
const router = express.Router();
const AchievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

router.get('/my', authMiddleware, AchievementController.getUserAchievements);
router.get('/', authMiddleware, AchievementController.getAllAchievements);

module.exports = router;
