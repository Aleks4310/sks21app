const express = require('express');
const router = express.Router();
const WheelController = require('../controllers/wheelController');
const authMiddleware = require('../middleware/auth');

router.post('/spin', authMiddleware, WheelController.spinWheel);

module.exports = router;
