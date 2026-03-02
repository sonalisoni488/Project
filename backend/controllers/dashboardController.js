// @desc    Get seller dashboard data
// @route   GET /api/seller/dashboard
// @access  Private (Seller only)
const getSellerDashboard = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: 'Seller dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        dashboard: {
          welcomeMessage: `Welcome back, ${user.name}!`,
          role: 'Seller',
          stats: {
            totalListings: 0,
            activeListings: 0,
            soldItems: 0,
            totalRevenue: 0
          },
          sections: [
            {
              title: 'Your Listings',
              description: 'Manage your waste material listings',
              action: 'View All Listings'
            },
            {
              title: 'Sales History',
              description: 'Track your sales and revenue',
              action: 'View Sales'
            },
            {
              title: 'Profile Settings',
              description: 'Update your account information',
              action: 'Edit Profile'
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    res.status(500).json({
      message: 'Server error fetching seller dashboard'
    });
  }
};

// @desc    Get buyer dashboard data
// @route   GET /api/buyer/dashboard
// @access  Private (Buyer only)
const getBuyerDashboard = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: 'Buyer dashboard data retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        dashboard: {
          welcomeMessage: `Welcome back, ${user.name}!`,
          role: 'Buyer',
          stats: {
            totalPurchases: 0,
            activeOrders: 0,
            completedOrders: 0,
            totalSpent: 0
          },
          sections: [
            {
              title: 'Available Listings',
              description: 'Browse waste materials from sellers',
              action: 'Browse Marketplace'
            },
            {
              title: 'Your Orders',
              description: 'Track your purchase history',
              action: 'View Orders'
            },
            {
              title: 'Profile Settings',
              description: 'Update your account information',
              action: 'Edit Profile'
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Buyer dashboard error:', error);
    res.status(500).json({
      message: 'Server error fetching buyer dashboard'
    });
  }
};

module.exports = {
  getSellerDashboard,
  getBuyerDashboard
};
