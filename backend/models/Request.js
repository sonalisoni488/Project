const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Buyer who sent the request
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Seller who receives the request
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Listing being requested
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  
  // Optional message from buyer
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Request status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  // Response message from seller
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Offer price (if buyer wants to negotiate)
  offerPrice: {
    type: Number,
    min: 0
  },
  
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

// Update the updatedAt field on save
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
requestSchema.index({ buyer: 1, listing: 1 });
requestSchema.index({ seller: 1, status: 1 });
requestSchema.index({ listing: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
