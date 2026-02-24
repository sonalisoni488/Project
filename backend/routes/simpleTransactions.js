const express = require('express');
const SimpleTransaction = require('../models/SimpleTransaction');
const Listing = require('../models/Listing');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/transactions
// @desc    Create a new transaction (purchase request)
// @access   Private (Buyer only)
router.post('/', protect, authorize('buyer'), [
  body('listing')
    .notEmpty()
    .withMessage('Listing ID is required'),
  body('agreedPrice')
    .isFloat({ min: 0 })
    .withMessage('Agreed price must be a positive number')
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

    const { listing, agreedPrice } = req.body;

    // Check if listing exists and is available
    const listingDoc = await Listing.findById(listing);
    if (!listingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listingDoc.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not available for purchase'
      });
    }

    // Check if buyer is not the seller
    if (listingDoc.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own listing'
      });
    }

    // Check if transaction already exists
    const existingTransaction = await SimpleTransaction.findOne({
      listing,
      buyer: req.user._id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending transaction for this listing'
      });
    }

    // Create transaction
    const transaction = await SimpleTransaction.create({
      buyer: req.user._id,
      seller: listingDoc.seller,
      listing,
      agreedPrice: parseFloat(agreedPrice)
    });

    // Update listing status to sold
    listingDoc.status = 'sold';
    await listingDoc.save();

    // Populate related documents
    await transaction.populate([
      { path: 'listing', select: 'title wasteType weight imageUrl' },
      { path: 'buyer', select: 'name location' },
      { path: 'seller', select: 'name location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Purchase request sent successfully',
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
});

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access   Private
router.get('/', protect, async (req, res) => {
  try {
    const { role = 'buyer', page = 1, limit = 10, status } = req.query;

    // Build query
    const query = role === 'seller' 
      ? { seller: req.user._id }
      : { buyer: req.user._id };

    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await SimpleTransaction.countDocuments(query);

    // Get transactions
    const transactions = await SimpleTransaction.find(query)
      .populate('listing', 'title wasteType weight imageUrl')
      .populate(role === 'buyer' ? 'seller' : 'buyer', 'name location')
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

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access   Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await SimpleTransaction.findById(req.params.id)
      .populate('listing', 'title wasteType weight imageUrl')
      .populate('buyer', 'name location')
      .populate('seller', 'name location');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in the transaction
    if (
      transaction.buyer._id.toString() !== req.user._id.toString() &&
      transaction.seller._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
});

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status
// @access   Private (Seller or Admin)
router.put('/:id/status', protect, [
  body('status')
    .isIn(['accepted', 'completed', 'cancelled'])
    .withMessage('Invalid status')
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

    const { status } = req.body;

    const transaction = await SimpleTransaction.findById(req.params.id)
      .populate('listing')
      .populate('buyer')
      .populate('seller');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is authorized to update status
    const isSeller = transaction.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can update transaction status'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [] // Final state
    };

    if (!validTransitions[transaction.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${transaction.status} to ${status}`
      });
    }

    // Update transaction status
    transaction.status = status;
    await transaction.save();

    // If cancelled, make listing available again
    if (status === 'cancelled') {
      await Listing.findByIdAndUpdate(transaction.listing._id, {
        status: 'available'
      });
    }

    res.json({
      success: true,
      message: `Transaction status updated to ${status}`,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction status'
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Cancel a transaction
// @access   Private (Buyer only, for pending transactions)
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await SimpleTransaction.findById(req.params.id)
      .populate('listing');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is the buyer
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can cancel the transaction'
      });
    }

    // Check if transaction is in pending status
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending transactions'
      });
    }

    // Update transaction status
    transaction.status = 'cancelled';
    await transaction.save();

    // Make listing available again
    await Listing.findByIdAndUpdate(transaction.listing._id, {
      status: 'available'
    });

    res.json({
      success: true,
      message: 'Transaction cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling transaction'
    });
  }
});

module.exports = router;
