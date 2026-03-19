const Order = require('../models/Order');

// Get buyer's purchase history (completed orders)
exports.getPurchaseHistory = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    // Find all orders for this buyer that are completed/delivered
    const orders = await Order.find({ 
      buyerId: buyerId,
      status: { $in: ['delivered', 'completed'] }
    })
    .populate('listingId', 'title wasteType imageUrl location')
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 }); // Most recent first
    
    // Transform data for frontend
    const purchaseHistory = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      listingTitle: order.listingTitle,
      sellerName: order.sellerName,
      sellerEmail: order.sellerEmail,
      listing: {
        title: order.listingId?.title,
        wasteType: order.listingId?.wasteType,
        imageUrl: order.listingId?.imageUrl,
        location: order.listingId?.location
      },
      totalAmount: order.totalPrice,
      purchaseDate: order.createdAt,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      actualDelivery: order.actualDelivery,
      orderTimeline: order.orderTimeline
    }));

    res.json({
      success: true,
      data: purchaseHistory,
      count: purchaseHistory.length
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase history',
      error: error.message
    });
  }
};

// Get all buyer orders (including pending ones)
exports.getAllBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    const orders = await Order.find({ buyerId })
      .populate('listingId', 'title wasteType imageUrl location')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};
