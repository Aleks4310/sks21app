const express = require('express');
const router = express.Router();
const QuestController = require('../controllers/questController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/daily', authMiddleware, QuestController.getDailyQuests);
router.get('/', authMiddleware, QuestController.getAllQuests);
router.post('/', authMiddleware, roleCheck(['marketing', 'admin']), QuestController.createQuest);
router.post('/:questId/complete', authMiddleware, QuestController.completeQuest);

module.exports = router;
