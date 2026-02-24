const express = require('express');
const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateTransaction, validateReview } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private/Buyer
router.post('/', protect, authorize('buyer'), validateTransaction, async (req, res) => {
  try {
    const { listingId, paymentMethod, pickupAddress, deliveryAddress, notes, pickupDate } = req.body;

    // Check if listing exists and is available
    const listing = await WasteListing.findById(listingId);
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

    // Check if buyer already has a pending transaction for this listing
    const existingTransaction = await Transaction.findOne({
      listingId,
      buyerId: req.user._id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingTransaction) {
      return res.status(400).json({
        message: 'You already have a pending transaction for this listing'
      });
    }

    // Create transaction
    const transaction = new Transaction({
      buyerId: req.user._id,
      sellerId: listing.sellerId,
      listingId,
      price: listing.finalPrice,
      paymentMethod,
      pickupAddress,
      deliveryAddress,
      notes,
      pickupDate: pickupDate ? new Date(pickupDate) : undefined
    });

    await transaction.save();

    // Update listing status to pending
    listing.status = 'pending';
    await listing.save();

    // Populate related data
    await transaction.populate([
      { path: 'listingId', select: 'wasteType weight imageUrl description' },
      { path: 'sellerId', select: 'name location rating phone' },
      { path: 'buyerId', select: 'name location rating phone' }
    ]);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      message: 'Server error while creating transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/transactions
// @desc    Get user's transactions (as buyer or seller)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role || req.user.role; // Default to user's role

    // Build query based on role
    const matchField = role === 'buyer' ? 'buyerId' : 'sellerId';
    const query = { [matchField]: req.user._id };

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const transactions = await Transaction.find(query)
      .populate('listingId', 'wasteType weight imageUrl description')
      .populate(role === 'buyer' ? 'sellerId' : 'buyerId', 'name location rating phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      message: 'Transactions retrieved successfully',
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      message: 'Server error while retrieving transactions'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get a specific transaction
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('listingId', 'wasteType weight imageUrl description sellerId')
      .populate('buyerId', 'name location rating phone')
      .populate('sellerId', 'name location rating phone');

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in the transaction or is admin
    const isInvolved = transaction.buyerId._id.toString() === req.user._id.toString() ||
                      transaction.sellerId._id.toString() === req.user._id.toString() ||
                      req.user.role === 'admin';

    if (!isInvolved) {
      return res.status(403).json({
        message: 'Access denied. You are not involved in this transaction.'
      });
    }

    res.json({
      message: 'Transaction retrieved successfully',
      transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      message: 'Server error while retrieving transaction'
    });
  }
});

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status
// @access  Private (buyer/seller involved)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'disputed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate('listingId');

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in the transaction
    const isBuyer = transaction.buyerId.toString() === req.user._id.toString();
    const isSeller = transaction.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({
        message: 'Access denied. You are not involved in this transaction.'
      });
    }

    // Validate status transitions based on user role
    const previousStatus = transaction.status;
    
    // Buyer can: confirm, cancel
    if (isBuyer) {
      if (status === 'confirmed' && previousStatus !== 'pending') {
        return res.status(400).json({
          message: 'Can only confirm pending transactions'
        });
      }
      if (status === 'cancelled' && !['pending', 'confirmed'].includes(previousStatus)) {
        return res.status(400).json({
          message: 'Can only cancel pending or confirmed transactions'
        });
      }
    }

    // Seller can: confirm, complete, cancel
    if (isSeller) {
      if (status === 'confirmed' && previousStatus !== 'pending') {
        return res.status(400).json({
          message: 'Can only confirm pending transactions'
        });
      }
      if (status === 'completed' && previousStatus !== 'confirmed') {
        return res.status(400).json({
          message: 'Can only complete confirmed transactions'
        });
      }
      if (status === 'cancelled' && !['pending', 'confirmed'].includes(previousStatus)) {
        return res.status(400).json({
          message: 'Can only cancel pending or confirmed transactions'
        });
      }
    }

    // Update transaction status
    transaction.status = status;

    // Update payment status if completed
    if (status === 'completed') {
      transaction.paymentStatus = 'paid';
      transaction.deliveryDate = new Date();
      
      // Update user stats
      await User.findByIdAndUpdate(transaction.buyerId, {
        $inc: { totalTransactions: 1 }
      });
      await User.findByIdAndUpdate(transaction.sellerId, {
        $inc: { totalTransactions: 1 }
      });
    }

    await transaction.save();

    // Update listing status based on transaction status
    if (status === 'completed') {
      await WasteListing.findByIdAndUpdate(transaction.listingId, {
        status: 'sold'
      });
    } else if (status === 'cancelled') {
      await WasteListing.findByIdAndUpdate(transaction.listingId, {
        status: 'available'
      });
    }

    // Populate updated transaction
    await transaction.populate([
      { path: 'listingId', select: 'wasteType weight imageUrl description' },
      { path: 'buyerId', select: 'name location rating phone' },
      { path: 'sellerId', select: 'name location rating phone' }
    ]);

    res.json({
      message: `Transaction ${status} successfully`,
      transaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      message: 'Server error while updating transaction status'
    });
  }
});

// @route   POST /api/transactions/:id/review
// @desc    Add review to transaction
// @access  Private (buyer/seller involved)
router.post('/:id/review', protect, validateReview, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        message: 'Can only review completed transactions'
      });
    }

    // Check if user is involved in the transaction
    const isBuyer = transaction.buyerId.toString() === req.user._id.toString();
    const isSeller = transaction.sellerId.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        message: 'Access denied. You are not involved in this transaction.'
      });
    }

    // Check if user has already reviewed
    if (isBuyer && transaction.buyerRating) {
      return res.status(400).json({
        message: 'You have already reviewed this transaction'
      });
    }
    if (isSeller && transaction.sellerRating) {
      return res.status(400).json({
        message: 'You have already reviewed this transaction'
      });
    }

    // Add review
    if (isBuyer) {
      transaction.buyerRating = rating;
      transaction.buyerReview = review;
      
      // Update seller's rating
      const seller = await User.findById(transaction.sellerId);
      const newTotalTransactions = seller.totalTransactions + 1;
      const newRating = ((seller.rating * seller.totalTransactions) + rating) / newTotalTransactions;
      
      seller.rating = Math.round(newRating * 10) / 10;
      seller.totalTransactions = newTotalTransactions;
      await seller.save();
    } else {
      transaction.sellerRating = rating;
      transaction.sellerReview = review;
      
      // Update buyer's rating
      const buyer = await User.findById(transaction.buyerId);
      const newTotalTransactions = buyer.totalTransactions + 1;
      const newRating = ((buyer.rating * buyer.totalTransactions) + rating) / newTotalTransactions;
      
      buyer.rating = Math.round(newRating * 10) / 10;
      buyer.totalTransactions = newTotalTransactions;
      await buyer.save();
    }

    await transaction.save();

    res.json({
      message: 'Review added successfully',
      transaction
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      message: 'Server error while adding review'
    });
  }
});

// @route   POST /api/transactions/:id/dispute
// @desc    Create a dispute for a transaction
// @access  Private (buyer/seller involved)
router.post('/:id/dispute', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const transactionId = req.params.id;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: 'Dispute reason must be at least 10 characters long'
      });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in the transaction
    const isBuyer = transaction.buyerId.toString() === req.user._id.toString();
    const isSeller = transaction.sellerId.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        message: 'Access denied. You are not involved in this transaction.'
      });
    }

    // Check if transaction can be disputed
    if (!['confirmed', 'completed'].includes(transaction.status)) {
      return res.status(400).json({
        message: 'Can only dispute confirmed or completed transactions'
      });
    }

    // Create dispute
    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    transaction.disputeResolved = false;

    await transaction.save();

    res.json({
      message: 'Dispute created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      message: 'Server error while creating dispute'
    });
  }
});

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private/Admin
router.get('/stats/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Transaction.getStats(startDate, endDate);

    // Additional stats
    const statusBreakdown = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const paymentMethodBreakdown = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    res.json({
      message: 'Transaction statistics retrieved successfully',
      stats: {
        ...stats,
        statusBreakdown,
        paymentMethodBreakdown,
        period: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      message: 'Server error while retrieving transaction statistics'
    });
  }
});

// @route   PUT /api/transactions/:id/dispute/resolve
// @desc    Resolve a dispute
// @access  Private/Admin
router.put('/:id/dispute/resolve', protect, authorize('admin'), async (req, res) => {
  try {
    const { resolution, status } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'disputed') {
      return res.status(400).json({
        message: 'This transaction is not disputed'
      });
    }

    // Resolve dispute
    transaction.status = status || 'completed';
    transaction.disputeResolved = true;
    transaction.disputeReason = `${transaction.disputeReason}\n\nAdmin Resolution: ${resolution}`;

    await transaction.save();

    res.json({
      message: 'Dispute resolved successfully',
      transaction
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      message: 'Server error while resolving dispute'
    });
  }
});

module.exports = router;
