const express = require('express');
const router = express.Router();
const MarketingController = require('../controllers/marketingController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/campaign', authMiddleware, roleCheck(['marketing', 'admin']), MarketingController.createCampaign);
router.get('/campaigns', authMiddleware, roleCheck(['marketing', 'marketing_analyst', 'admin']), MarketingController.listCampaigns);

module.exports = router;
