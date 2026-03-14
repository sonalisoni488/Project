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
}, upload.single('image'), (error, req, res, next) => {
  // Handle multer errors
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer Error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Expected: image'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`
    });
  }
  
  if (error) {
    console.error('❌ Upload Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
  
  next();
}, (req, res, next) => {
  console.log('🔍 After multer middleware');
  console.log('🔍 req.file:', req.file);
  console.log('🔍 req.body:', req.body);
  console.log('🔍 Content-Type:', req.headers['content-type']);
  console.log('🔍 Content-Length:', req.headers['content-length']);
  
  // Check if multer failed
  if (!req.file && req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('❌ Multer failed to process file');
    console.log('❌ Debug info:', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      hasFiles: !!req.files,
      fileField: req.file ? req.file.fieldname : 'none'
    });
    return res.status(400).json({
      success: false,
      message: 'Failed to process uploaded file'
    });
  }
  
  console.log('✅ File upload middleware passed');
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
