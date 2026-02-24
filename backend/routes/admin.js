const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const SimpleTransaction = require('../models/SimpleTransaction');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access   Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user (Admin only)
// @access   Private (Admin only)
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (Admin only)
// @access   Private (Admin only)
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, location, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (location) user.location = location;
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access   Private (Admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/admin/listings
// @desc    Get all listings (Admin only)
// @access   Private (Admin only)
router.get('/listings', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, wasteType, search } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (wasteType) query.wasteType = wasteType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Listing.countDocuments(query);

    // Get listings
    const listings = await Listing.find(query)
      .populate('seller', 'name email location')
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
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
});

// @route   DELETE /api/admin/listings/:id
// @desc    Delete listing (Admin only)
// @access   Private (Admin only)
router.delete('/listings/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Delete image from Cloudinary
    if (listing.imageUrl) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
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

// @route   GET /api/admin/transactions
// @desc    Get all transactions (Admin only)
// @access   Private (Admin only)
router.get('/transactions', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;

    // Get total count
    const total = await SimpleTransaction.countDocuments(query);

    // Get transactions
    const transactions = await SimpleTransaction.find(query)
      .populate('listing', 'title wasteType weight')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics (Admin only)
// @access   Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get listing statistics
    const totalListings = await Listing.countDocuments();
    const availableListings = await Listing.countDocuments({ status: 'available' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });

    // Get transaction statistics
    const transactionStats = await SimpleTransaction.getStats();
    const mostTradedWasteTypes = await SimpleTransaction.getMostTradedWasteTypes();

    // Get waste type distribution
    const wasteTypeStats = await Listing.aggregate([
      {
        $group: {
          _id: '$wasteType',
          count: { $sum: 1 },
          totalWeight: { $sum: '$weight' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          sellers: totalSellers,
          buyers: totalBuyers,
          admins: totalAdmins
        },
        listings: {
          total: totalListings,
          available: availableListings,
          sold: soldListings
        },
        transactions: transactionStats,
        mostTradedWasteTypes,
        wasteTypeDistribution: wasteTypeStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
