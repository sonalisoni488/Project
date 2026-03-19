const Request = require('../models/Request');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createChatForRequest } = require('./chatController');
const { createNotification } = require('./notificationController');

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (buyer only)
const createRequest = async (req, res) => {
  try {
    console.log('🔍 Creating request for user:', req.user.id);
    console.log('📋 Request data:', req.body);

    const { listingId, message, offerPrice } = req.body;

    // Validate required fields
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required'
      });
    }

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is not the seller of the listing
    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request to buy your own listing'
      });
    }

    // Check if request already exists for this buyer and listing
    const existingRequest = await Request.findOne({
      buyer: req.user.id,
      listing: listingId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent a request for this listing'
      });
    }

    // Get seller information
    const seller = await User.findById(listing.seller);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Create new request
    const request = new Request({
      buyer: req.user.id,
      seller: listing.seller,
      listing: listingId,
      message: message || '',
      offerPrice: offerPrice || listing.price,
      status: 'pending'
    });

    const savedRequest = await request.save();

    // Create notification for seller about new request
    await createNotification(
      listing.seller,
      'request',
      'New Request Received',
      `New request received for your listing: ${listing.title}`,
      savedRequest._id,
      'request'
    );

    // Create chat for this request
    const chat = await createChatForRequest(
      savedRequest._id,
      req.user.id,
      listing.seller,
      listingId,
      message
    );

    // Populate request with related data
    const populatedRequest = await Request.findById(savedRequest._id)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'title price imageUrl');

    console.log('✅ Request created successfully:', savedRequest._id);
    console.log('✅ Chat created successfully:', chat ? chat._id : 'existing');

    res.status(201).json({
      success: true,
      message: 'Request sent successfully',
      data: populatedRequest,
      chat: chat
    });

  } catch (error) {
    console.error('❌ Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get requests for buyer
// @route   GET /api/requests/buyer
// @access  Private (buyer only)
const getBuyerRequests = async (req, res) => {
  try {
    console.log('🔍 Fetching requests for buyer:', req.user.id);

    const requests = await Request.find({ buyer: req.user.id })
      .populate('listing', 'title price imageUrl')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Error fetching buyer requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Get requests for seller
// @route   GET /api/requests/seller
// @access  Private (seller only)
const getSellerRequests = async (req, res) => {
  try {
    console.log('🔍 Fetching requests for seller:', req.user.id);

    const requests = await Request.find({ seller: req.user.id })
      .populate('listing', 'title price imageUrl')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('❌ Error fetching seller requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests'
    });
  }
};

// @desc    Update request status (accept/reject)
// @route   PUT /api/requests/:id/status
// @access  Private (seller only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    const requestId = req.params.id;

    console.log('🔍 Updating request status:', requestId, '→', status);

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted or rejected'
      });
    }

    // Find request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify this request belongs to the seller
    if (request.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This request does not belong to you'
      });
    }

    // Update request
    request.status = status;
    if (responseMessage) {
      request.responseMessage = responseMessage;
    }

    const updatedRequest = await request.save();

    // Populate with related data
    const populatedRequest = await Request.findById(updatedRequest._id)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'title price imageUrl');

    console.log('✅ Request status updated:', populatedRequest._id, '→', status);

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data: populatedRequest
    });

  } catch (error) {
    console.error('❌ Error updating request status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating request status'
    });
  }
};

module.exports = {
  createRequest,
  getBuyerRequests,
  getSellerRequests,
  updateRequestStatus
};
