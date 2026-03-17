const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createRequest,
  getBuyerRequests,
  getSellerRequests,
  updateRequestStatus
} = require('../controllers/requestController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/requests
// @desc    Create a new request
// @access  Private (buyer only)
router.post('/', authorize('buyer'), createRequest);

// @route   GET /api/requests/buyer
// @desc    Get requests for buyer
// @access  Private (buyer only)
router.get('/buyer', authorize('buyer'), getBuyerRequests);

// @route   GET /api/requests/seller
// @desc    Get requests for seller
// @access  Private (seller only)
router.get('/seller', authorize('seller'), getSellerRequests);

// @route   PUT /api/requests/:id/status
// @desc    Update request status (accept/reject)
// @access  Private (seller only)
router.put('/:id/status', authorize('seller'), updateRequestStatus);

module.exports = router;
