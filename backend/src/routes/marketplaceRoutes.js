const express = require('express');
const router = express.Router();
const MarketplaceController = require('../controllers/marketplaceController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, MarketplaceController.listItems);
router.get('/:itemId', authMiddleware, MarketplaceController.getItem);
router.post('/:itemId/purchase', authMiddleware, MarketplaceController.purchaseItem);

module.exports = router;
