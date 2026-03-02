const express = require('express');
const { protect } = require('../middleware/simpleAuth');
const { upload } = require('../config/cloudinary');
const { 
  getDashboardData, 
  getListings, 
  createListing, 
  updateListing, 
  deleteListing 
} = require('../controllers/sellerController');

const router = express.Router();

// All seller routes require authentication
router.use(protect);

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard data
// @access  Private (seller only)
router.get('/dashboard', getDashboardData);

// @route   GET /api/seller/listings
// @desc    Get seller's waste listings
// @access  Private (seller only)
router.get('/listings', getListings);

// @route   POST /api/seller/listings
// @desc    Create new waste listing
// @access  Private (seller only)
router.post('/listings', upload.single('image'), createListing);

// @route   PUT /api/seller/listings/:id
// @desc    Update waste listing
// @access  Private (seller only)
router.put('/listings/:id', upload.single('image'), updateListing);

// @route   DELETE /api/seller/listings/:id
// @desc    Delete waste listing
// @access  Private (seller only)
router.delete('/listings/:id', deleteListing);

module.exports = router;
