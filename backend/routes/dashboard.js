const express = require('express');
const { getSellerDashboard, getBuyerDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/simpleAuth');

const router = express.Router();

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard data
// @access  Private (Seller only)
router.get('/dashboard', protect, authorize('seller'), getSellerDashboard);

// @route   GET /api/buyer/dashboard
// @desc    Get buyer dashboard data
// @access  Private (Buyer only)
router.get('/dashboard', protect, authorize('buyer'), getBuyerDashboard);

module.exports = router;
