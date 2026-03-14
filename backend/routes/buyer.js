const express = require('express');
const { protect, authorize } = require('../middleware/simpleAuth');
const router = express.Router();

console.log('🔍 Buyer routes loaded');

// All buyer routes require authentication and buyer role
router.use(protect);
router.use(authorize('buyer'));

// @route   GET /api/buyer/dashboard
// @desc    Get buyer dashboard data
// @access  Private (buyer only)
router.get('/dashboard', async (req, res) => {
  console.log('🔍 Buyer dashboard route hit!');
  console.log('🔍 User:', req.user);
  
  try {
    console.log('🔍 Fetching buyer dashboard data for user:', req.user.id);
    
    // For now, return mock data since we don't have transactions yet
    const dashboardData = {
      dashboard: {
        welcomeMessage: `Welcome back, ${req.user.name}!`,
        stats: {
          totalPurchases: 0,
          activeOrders: 0,
          completedOrders: 0,
          totalSpent: 0
        },
        sections: [
          {
            title: 'Browse Marketplace',
            description: 'Find available waste materials from sellers',
            action: 'Browse',
            icon: 'search'
          },
          {
            title: 'Your Orders',
            description: 'Track your purchase orders and history',
            action: 'View Orders',
            icon: 'package'
          },
          {
            title: 'Saved Listings',
            description: 'Manage your saved and favorite listings',
            action: 'View Saved',
            icon: 'heart'
          }
        ]
      }
    };

    console.log('✅ Buyer dashboard data sent successfully');
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Error fetching buyer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

module.exports = router;
