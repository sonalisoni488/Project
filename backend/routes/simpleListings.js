const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Listing = require('../models/Listing');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Cloudinary
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload_stream({
      resource_type: 'image',
      folder: 'waste2resource',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return new Promise((resolve, reject) => {
      file.stream.pipe(result);
      result.on('finish', () => {
        resolve(result.public_id);
      });
      result.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    throw error;
  }
};

// @route   GET /api/listings
// @desc    Get all listings with filtering
// @access   Public
router.get('/', async (req, res) => {
  try {
    console.log('=== MARKETPLACE API HIT (simpleListings) ===');
    console.log('Request query params:', req.query);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const {
      wasteType,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const searchQuery = { status: 'available' };

    if (wasteType) searchQuery.wasteType = wasteType;
    if (location) searchQuery.location = new RegExp(location, 'i');

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // DEBUG: Check what's in the database
    console.log('=== DEBUG MARKETPLACE LISTINGS (simpleListings) ===');
    console.log('Search query:', searchQuery);
    
    // Check all listings without any filter
    const allListings = await Listing.find({});
    console.log('Total listings in DB (Listing model):', allListings.length);
    if (allListings.length > 0) {
      console.log('Sample listing structure:', JSON.stringify(allListings[0], null, 2));
      console.log('Status values in DB:', allListings.map(l => l.status));
    }
    
    // Check with the actual search query
    const filteredListings = await Listing.find(searchQuery);
    console.log('Listings matching search query:', filteredListings.length);
    if (filteredListings.length === 0 && allListings.length > 0) {
      console.log('QUERY ISSUE: Listings exist but dont match search query');
      console.log('Expected status: "available"');
      console.log('Actual statuses:', allListings.map(l => l.status));
    }

    // Get total count for pagination
    const total = await Listing.countDocuments(searchQuery);

    // Get listings with pagination
    const listings = await Listing.find(searchQuery)
      .populate('seller', 'name location')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    console.log('Final query result:', listings.length);
    console.log('=== END DEBUG MARKETPLACE LISTINGS (simpleListings) ===');

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        debug: {
          totalListingsInDb: allListings.length,
          filteredCount: filteredListings.length,
          finalResultCount: listings.length
        }
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single listing
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching listing with ID:', req.params.id);
    
    // First, get the listing without populate to check the seller ID
    const listingWithoutPopulate = await Listing.findById(req.params.id);
    console.log('🔍 Listing without populate:', !!listingWithoutPopulate);
    console.log('🔍 Seller ID from listing:', listingWithoutPopulate?.seller);
    
    // Now try to populate with explicit field selection
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: 'seller',
        select: 'name location email phone'
      });

    console.log('🔍 Listing found:', !!listing);
    console.log('🔍 Seller data after populate:', listing?.seller);
    console.log('🔍 Seller email:', listing?.seller?.email);
    console.log('🔍 Seller phone:', listing?.seller?.phone);

    // Also check the user directly
    if (listingWithoutPopulate?.seller) {
      const User = require('../models/User');
      const directUser = await User.findById(listingWithoutPopulate.seller);
      console.log('🔍 Direct user query result:', !!directUser);
      console.log('🔍 Direct user email:', directUser?.email);
      console.log('🔍 Direct user name:', directUser?.name);
      
      // Manual fix: If populate didn't work, manually add user data
      if (!listing?.seller?.email && directUser) {
        listing.seller = {
          ...listing.seller,
          email: directUser.email,
          phone: directUser.phone
        };
        console.log('🔍 Manually added email to seller data');
      }
    }

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing'
    });
  }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access   Private (Seller only)
router.post('/', protect, authorize('seller'), upload.single('image'), [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('wasteType')
    .isIn(['Plastic', 'Paper', 'Metal', 'Textile', 'E-waste', 'Construction'])
    .withMessage('Invalid waste type'),
  body('weight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Weight must be between 0.1 and 1000 kg'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
], async (req, res) => {
  try {
    console.log('🚀 POST /api/listings route hit');
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 Request body:', req.body);
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Debug: Check file upload
    console.log('🔍 File upload debug:');
    console.log('  - req.file:', req.file);
    console.log('  - req.files:', req.files);
    console.log('  - Content-Type:', req.headers['content-type']);
    console.log('  - Content-Length:', req.headers['content-length']);

    // Check if image was uploaded
    if (!req.file) {
      console.log('❌ No file received in req.file');
      console.log('❌ Request headers:', {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'authorization': req.headers.authorization ? 'Bearer ***' : 'None'
      });
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    console.log('✅ File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const { title, wasteType, weight, price, description, location } = req.body;

    // Upload image to Cloudinary
    let imageUrl;
    try {
      const publicId = await uploadImage(req.file);
      imageUrl = cloudinary.url(publicId);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }

    // Create listing
    const listing = await Listing.create({
      seller: req.user._id,
      wasteType,
      weight: parseFloat(weight),
      price: parseFloat(price),
      description,
      imageUrl,
      location
    });

    // Populate seller info
    await listing.populate('seller', 'name location');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating listing'
    });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access   Private (Seller only, owner)
router.put('/:id', protect, authorize('seller'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('wasteType')
    .optional()
    .isIn(['Plastic', 'Paper', 'Metal', 'Textile', 'E-waste', 'Construction'])
    .withMessage('Invalid waste type'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Weight must be between 0.1 and 1000 kg'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
    }

    // Check if listing is sold
    if (listing.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a sold listing'
      });
    }

    // Update fields
    const { title, wasteType, weight, price, description, location } = req.body;
    if (title) listing.title = title;
    if (wasteType) listing.wasteType = wasteType;
    if (weight) listing.weight = parseFloat(weight);
    if (price) listing.price = parseFloat(price);
    if (description) listing.description = description;
    if (location) listing.location = location;

    await listing.save();

    // Populate seller info
    await listing.populate('seller', 'name location');

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: {
        listing
      }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing'
    });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access   Private (Seller or Admin, owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing or is admin
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings'
      });
    }

    // Delete image from Cloudinary
    if (listing.imageUrl) {
      try {
        const publicId = listing.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing'
    });
  }
});

// @route   GET /api/listings/my
// @desc    Get current user's listings
// @access   Private (Seller only)
router.get('/my', protect, authorize('seller'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { seller: req.user._id };
    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Listing.countDocuments(query);

    // Get listings
    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your listings'
    });
  }
});

module.exports = router;
