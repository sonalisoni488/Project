const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const purchaseController = require('../controllers/purchaseController');

// Protect all routes
router.use(protect);

// Get purchase history (completed orders)
router.get('/history', purchaseController.getPurchaseHistory);

// Get all buyer orders (including pending)
router.get('/orders', purchaseController.getAllBuyerOrders);

module.exports = router;
