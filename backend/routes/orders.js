const express = require('express');
const { protect, authorize } = require('../middleware/simpleAuth');
const router = express.Router();

// Import models to ensure they're registered
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');

// All order routes require authentication
router.use(protect);

// @route   POST /api/orders
// @desc    Create a new order (from accepted buyer request)
// @access  Private (buyer only)
router.post('/', authorize('buyer'), async (req, res) => {
  try {
    console.log('🔍 Creating new order:', req.body);
    
    const { 
      buyerRequestId, 
      quantity, 
      shippingAddress, 
      buyerNotes 
    } = req.body;
    
    // Get the buyer request to create order from
    const BuyerRequest = require('../models/BuyerRequest');
    const buyerRequest = await BuyerRequest.findById(buyerRequestId)
      .populate('listingId')
      .populate('buyerId')
      .populate('sellerId');
    
    if (!buyerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Buyer request not found'
      });
    }
    
    if (buyerRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only create order from accepted buyer request'
      });
    }
    
    // Check if order already exists for this buyer request
    const existingOrder = await Order.findOne({ buyerRequestId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order already exists for this request'
      });
    }
    
    // Create new order
    const newOrder = new Order({
      buyerId: buyerRequest.buyerId._id,
      buyerName: buyerRequest.buyerId.name,
      buyerEmail: buyerRequest.buyerId.email,
      sellerId: buyerRequest.sellerId._id,
      sellerName: buyerRequest.sellerId.name,
      sellerEmail: buyerRequest.sellerId.email,
      listingId: buyerRequest.listingId._id,
      listingTitle: buyerRequest.listingId.title,
      listingImage: buyerRequest.listingId.imageUrl,
      quantity: quantity || 1,
      unitPrice: buyerRequest.offerPrice,
      totalPrice: (quantity || 1) * buyerRequest.offerPrice,
      shippingAddress,
      buyerNotes,
      status: 'pending'
    });
    
    await newOrder.save();
    
    // Update buyer request status
    await BuyerRequest.findByIdAndUpdate(buyerRequestId, {
      status: 'ordered'
    });
    
    console.log('✅ Order created successfully:', newOrder.orderId);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// @route   GET /api/orders/buyer
// @desc    Get all orders for the logged-in buyer
// @access  Private (buyer only)
router.get('/buyer', authorize('buyer'), async (req, res) => {
  try {
    console.log('🔍 Fetching orders for buyer:', req.user.id);
    
    const orders = await Order.find({ buyerId: req.user.id })
      .populate('listingId', 'title imageUrl wasteType')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('✅ Buyer orders fetched:', orders.length);
    
    res.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('❌ Error fetching buyer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/seller
// @desc    Get all orders for the logged-in seller
// @access  Private (seller only)
router.get('/seller', authorize('seller'), async (req, res) => {
  try {
    console.log('🔍 Fetching orders for seller:', req.user.id);
    
    const orders = await Order.find({ sellerId: req.user.id })
      .populate('listingId', 'title imageUrl wasteType')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('✅ Seller orders fetched:', orders.length);
    
    res.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (seller only)
// @access  Private (seller only)
router.put('/:id/status', authorize('seller'), async (req, res) => {
  try {
    const { status, sellerNotes, trackingNumber, estimatedDelivery, shippingCarrier } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify this order belongs to the seller
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not belong to you.'
      });
    }
    
    // Update order
    const updateData = { status };
    if (sellerNotes) updateData.sellerNotes = sellerNotes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (shippingCarrier) updateData.shippingCarrier = shippingCarrier;
    
    // Add shipping date if status is shipped
    if (status === 'shipped') {
      updateData.shippingDate = new Date();
    }
    
    // Add actual delivery date if status is delivered
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }
    
    // Add timeline entry
    const timelineEntry = {
      status,
      timestamp: new Date(),
      description: getStatusDescription(status),
      updatedBy: req.user.id
    };
    
    updateData.$push = { orderTimeline: timelineEntry };
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('listingId', 'title imageUrl description wasteType')
     .populate('buyerId', 'name email')
     .populate('sellerId', 'name email phone');
    
    console.log('✅ Order status updated:', updatedOrder.orderId, '→', status);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// Helper function to get status descriptions
function getStatusDescription(status) {
  const descriptions = {
    'pending': 'Order placed, waiting for seller confirmation',
    'confirmed': 'Order confirmed by seller, preparing for shipment',
    'processing': 'Order is being processed and packaged',
    'shipped': 'Order has been shipped and is on its way',
    'delivered': 'Order has been successfully delivered',
    'cancelled': 'Order has been cancelled'
  };
  return descriptions[status] || 'Status updated';
}

// @route   PUT /api/orders/:id/payment
// @desc    Process payment for order (buyer only)
// @access  Private (buyer only)
router.put('/:id/payment', authorize('buyer'), async (req, res) => {
  try {
    const { paymentMethod, paymentId } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify this order belongs to the buyer
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not belong to you.'
      });
    }
    
    // Check if order is in a payable state
    if (order.status !== 'confirmed' && order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Order must be confirmed before payment can be processed'
      });
    }
    
    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this order'
      });
    }
    
    // Process payment (in real implementation, integrate with payment gateway)
    const paymentSuccess = true; // Simulate successful payment
    
    if (paymentSuccess) {
      // Update payment information
      const updateData = {
        paymentStatus: 'paid',
        paymentMethod,
        paymentId,
        paymentDate: new Date()
      };
      
      // Add timeline entry
      const timelineEntry = {
        status: 'payment_completed',
        timestamp: new Date(),
        description: `Payment completed via ${paymentMethod}`,
        updatedBy: req.user.id
      };
      
      updateData.$push = { orderTimeline: timelineEntry };
      
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('listingId', 'title imageUrl')
       .populate('sellerId', 'name email');
      
      console.log('✅ Payment processed for order:', updatedOrder.orderId);
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: updatedOrder
      });
    } else {
      // Payment failed
      await Order.findByIdAndUpdate(req.params.id, {
        paymentStatus: 'failed',
        paymentDate: new Date()
      });
      
      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.'
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listingId', 'title imageUrl wasteType description')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify access (buyer or seller of this order)
    if (order.buyerId._id.toString() !== req.user.id && 
        order.sellerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order details'
    });
  }
});

module.exports = router;
