const express = require('express');
const router = express.Router();
const LeaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, LeaderboardController.getLeaderboard);
router.get('/my-rank', authMiddleware, LeaderboardController.getUserRank);
router.get('/league', authMiddleware, LeaderboardController.getUserLeague);

module.exports = router;
