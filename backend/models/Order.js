const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    default: ''
  },
  
  // Buyer information
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  
  // Seller information
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerEmail: {
    type: String,
    required: true
  },
  
  // Product information
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  listingTitle: {
    type: String,
    required: true
  },
  listingImage: {
    type: String
  },
  
  // Order details
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
    default: 'cash_on_delivery'
  },
  paymentId: {
    type: String // Transaction ID from payment gateway
  },
  paymentDate: {
    type: Date
  },
  
  // Shipping information
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Tracking information
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  shippingCarrier: {
    type: String,
    enum: ['fedex', 'ups', 'dhl', 'usps', 'local_courier', 'self_pickup'],
    default: 'local_courier'
  },
  shippingDate: Date,
  
  // Order timeline
  orderTimeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Messages/notes
  buyerNotes: String,
  sellerNotes: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique order ID and timeline
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderId = `ORD-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  }
  
  // Add initial timeline entry for new orders
  if (this.isNew) {
    this.orderTimeline = [{
      status: 'pending',
      timestamp: new Date(),
      description: 'Order placed successfully',
      updatedBy: this.buyerId
    }];
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
