const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const WasteListing = require('../models/WasteListing');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateWasteListing } = require('../middleware/validation');
const axios = require('axios');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to call AI service for waste classification
const classifyWaste = async (imageUrl) => {
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
      image_url: imageUrl
    });
    
    return {
      wasteType: response.data.waste_type,
      confidence: response.data.confidence
    };
  } catch (error) {
    console.error('AI classification error:', error);
    // Fallback to default classification
    return {
      wasteType: 'Plastic',
      confidence: 50
    };
  }
};

// Helper function to call AI service for price prediction
const predictPrice = async (wasteType, weight, location) => {
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/price`, {
      waste_type: wasteType,
      weight,
      location
    });
    
    return response.data.suggested_price;
  } catch (error) {
    console.error('AI pricing error:', error);
    // Fallback to simple pricing based on weight and type
    const basePrices = {
      'Plastic': 0.5,
      'Metal': 2.0,
      'Paper': 0.3,
      'Textile': 0.8,
      'E-waste': 5.0,
      'Construction': 0.2,
      'Glass': 0.4,
      'Organic': 0.1
    };
    
    const basePrice = basePrices[wasteType] || 0.5;
    return Math.round(basePrice * weight * 100) / 100;
  }
};

// @route   POST /api/listings
// @desc    Create a new waste listing
// @access  Private/Seller
router.post('/', protect, authorize('seller'), upload.single('image'), validateWasteListing, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Image is required'
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'waste2resource',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const imageUrl = result.secure_url;

    // Classify waste using AI
    const classification = await classifyWaste(imageUrl);

    // Predict price using AI
    const suggestedPrice = await predictPrice(
      classification.wasteType,
      req.body.weight,
      req.body.location
    );

    // Create listing
    const listing = new WasteListing({
      sellerId: req.user._id,
      wasteType: classification.wasteType,
      weight: parseFloat(req.body.weight),
      description: req.body.description,
      imageUrl,
      aiConfidence: classification.confidence,
      suggestedPrice,
      finalPrice: parseFloat(req.body.finalPrice) || suggestedPrice,
      location: req.body.location,
      condition: req.body.condition || 'good',
      pickupAvailable: req.body.pickupAvailable !== 'false',
      deliveryAvailable: req.body.deliveryAvailable === 'true',
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    });

    await listing.save();

    // Populate seller info
    await listing.populate('sellerId', 'name location rating');

    res.status(201).json({
      message: 'Listing created successfully',
      listing: {
        ...listing.toObject(),
        aiClassification: {
          wasteType: classification.wasteType,
          confidence: classification.confidence
        },
        suggestedPrice
      }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      message: 'Server error while creating listing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/listings
// @desc    Get all available listings with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = { status: 'available' };

    // Filter by waste type
    if (req.query.wasteType) {
      searchQuery.wasteType = req.query.wasteType;
    }

    // Filter by location
    if (req.query.location) {
      searchQuery.location = new RegExp(req.query.location, 'i');
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      searchQuery.finalPrice = {};
      if (req.query.minPrice) {
        searchQuery.finalPrice.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        searchQuery.finalPrice.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by weight range
    if (req.query.minWeight || req.query.maxWeight) {
      searchQuery.weight = {};
      if (req.query.minWeight) {
        searchQuery.weight.$gte = parseFloat(req.query.minWeight);
      }
      if (req.query.maxWeight) {
        searchQuery.weight.$lte = parseFloat(req.query.maxWeight);
      }
    }

    // Filter by condition
    if (req.query.condition) {
      searchQuery.condition = req.query.condition;
    }

    // Filter by pickup/delivery availability
    if (req.query.pickupAvailable === 'true') {
      searchQuery.pickupAvailable = true;
    }
    if (req.query.deliveryAvailable === 'true') {
      searchQuery.deliveryAvailable = true;
    }

    // Search by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      searchQuery.tags = { $in: tags };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    switch (req.query.sort) {
      case 'price_low':
        sortOption = { finalPrice: 1 };
        break;
      case 'price_high':
        sortOption = { finalPrice: -1 };
        break;
      case 'weight_high':
        sortOption = { weight: -1 };
        break;
      case 'weight_low':
        sortOption = { weight: 1 };
        break;
      case 'popular':
        sortOption = { viewCount: -1 };
        break;
    }

    const listings = await WasteListing.find(searchQuery)
      .populate('sellerId', 'name location rating')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await WasteListing.countDocuments(searchQuery);

    // Increment view count for viewed listings (if authenticated)
    if (req.user && req.query.viewed) {
      const viewedIds = Array.isArray(req.query.viewed) ? req.query.viewed : [req.query.viewed];
      await WasteListing.updateMany(
        { _id: { $in: viewedIds } },
        { $inc: { viewCount: 1 } }
      );
    }

    res.json({
      message: 'Listings retrieved successfully',
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        wasteType: req.query.wasteType,
        location: req.query.location,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        minWeight: req.query.minWeight,
        maxWeight: req.query.maxWeight,
        condition: req.query.condition,
        sort: req.query.sort
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      message: 'Server error while retrieving listings'
    });
  }
});

// @route   GET /api/listings/:id
// @desc    Get a specific listing
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id)
      .populate('sellerId', 'name location rating phone totalTransactions');

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Increment view count
    await listing.incrementViewCount();

    // Check if current user is interested
    let isInterested = false;
    if (req.user) {
      isInterested = listing.interestedBuyers.some(id => 
        id.toString() === req.user._id.toString()
      );
    }

    res.json({
      message: 'Listing retrieved successfully',
      listing: {
        ...listing.toObject(),
        isInterested,
        seller: listing.sellerId
      }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      message: 'Server error while retrieving listing'
    });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private/Seller (owner only)
router.put('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only update your own listings'
      });
    }

    // Check if listing can be updated (not sold or in transaction)
    if (listing.status === 'sold') {
      return res.status(400).json({
        message: 'Cannot update a sold listing'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['description', 'finalPrice', 'condition', 'pickupAvailable', 'deliveryAvailable', 'tags'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          updates[field] = JSON.parse(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedListing = await WasteListing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('sellerId', 'name location rating');

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      message: 'Server error while updating listing'
    });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private/Seller (owner only)
router.delete('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only delete your own listings'
      });
    }

    // Check if listing can be deleted
    if (listing.status === 'sold') {
      return res.status(400).json({
        message: 'Cannot delete a sold listing'
      });
    }

    // Delete image from Cloudinary
    if (listing.imageUrl) {
      const publicId = listing.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`waste2resource/${publicId}`);
    }

    await WasteListing.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      message: 'Server error while deleting listing'
    });
  }
});

// @route   POST /api/listings/:id/interest
// @desc    Show interest in a listing
// @access  Private/Buyer
router.post('/:id/interest', protect, authorize('buyer'), async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({
        message: 'This listing is no longer available'
      });
    }

    // Add buyer to interested buyers
    await listing.addInterestedBuyer(req.user._id);

    res.json({
      message: 'Interest recorded successfully',
      listing
    });
  } catch (error) {
    console.error('Show interest error:', error);
    res.status(500).json({
      message: 'Server error while recording interest'
    });
  }
});

// @route   DELETE /api/listings/:id/interest
// @desc    Remove interest from a listing
// @access  Private/Buyer
router.delete('/:id/interest', protect, authorize('buyer'), async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found'
      });
    }

    // Remove buyer from interested buyers
    await listing.removeInterestedBuyer(req.user._id);

    res.json({
      message: 'Interest removed successfully',
      listing
    });
  } catch (error) {
    console.error('Remove interest error:', error);
    res.status(500).json({
      message: 'Server error while removing interest'
    });
  }
});

// @route   GET /api/listings/my
// @desc    Get current user's listings
// @access  Private/Seller
router.get('/my/listings', protect, authorize('seller'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const listings = await WasteListing.find({ sellerId: req.user._id })
      .populate('interestedBuyers', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WasteListing.countDocuments({ sellerId: req.user._id });

    res.json({
      message: 'Your listings retrieved successfully',
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      message: 'Server error while retrieving your listings'
    });
  }
});

// @route   GET /api/listings/stats
// @desc    Get marketplace statistics
// @access  Private/Admin
router.get('/stats/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await WasteListing.aggregate([
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          availableListings: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldListings: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          totalWeight: { $sum: '$weight' },
          averagePrice: { $avg: '$finalPrice' },
          totalValue: { $sum: '$finalPrice' }
        }
      }
    ]);

    const wasteTypeStats = await WasteListing.aggregate([
      {
        $group: {
          _id: '$wasteType',
          count: { $sum: 1 },
          totalWeight: { $sum: '$weight' },
          averagePrice: { $avg: '$finalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      message: 'Statistics retrieved successfully',
      stats: stats[0] || {
        totalListings: 0,
        availableListings: 0,
        soldListings: 0,
        totalWeight: 0,
        averagePrice: 0,
        totalValue: 0
      },
      wasteTypeStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error while retrieving statistics'
    });
  }
});

module.exports = router;
