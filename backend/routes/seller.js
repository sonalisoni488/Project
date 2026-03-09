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
router.post('/listings', (req, res, next) => {
  console.log('🔍 POST /api/seller/listings route hit');
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Content-Type:', req.headers['content-type']);
  next();
}, upload.single('image'), (req, res, next) => {
  console.log('🔍 After multer middleware');
  console.log('🔍 req.file:', req.file);
  console.log('🔍 req.body:', req.body);
  
  // Check if multer failed
  if (!req.file && req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('❌ Multer failed to process file');
    return res.status(400).json({
      success: false,
      message: 'Failed to process uploaded file'
    });
  }
  
  next();
}, (error, req, res, next) => {
  console.error('❌ Middleware error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error during file processing'
  });
}, createListing);

// @route   PUT /api/seller/listings/:id
// @desc    Update waste listing
// @access  Private (seller only)
router.put('/listings/:id', upload.single('image'), updateListing);

// @route   DELETE /api/seller/listings/:id
// @desc    Delete waste listing
// @access  Private (seller only)
router.delete('/listings/:id', deleteListing);

module.exports = router;
