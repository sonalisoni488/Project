const mongoose = require('mongoose');

const simpleTransactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing ID is required']
  },
  agreedPrice: {
    type: Number,
    required: [true, 'Agreed price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
simpleTransactionSchema.index({ buyer: 1 });
simpleTransactionSchema.index({ seller: 1 });
simpleTransactionSchema.index({ listing: 1 });
simpleTransactionSchema.index({ status: 1 });
simpleTransactionSchema.index({ createdAt: -1 });

// Pre-save middleware to update listing status
simpleTransactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Update listing status when transaction is created
    if (this.status === 'pending') {
      await mongoose.model('Listing').findByIdAndUpdate(
        this.listing,
        { status: 'sold' }
      );
    }
  }
  next();
});

// Static method to get transactions by user
simpleTransactionSchema.statics.getByUser = function(userId, role) {
  const query = role === 'seller' 
    ? { seller: userId }
    : { buyer: userId };
    
  return this.find(query)
    .populate('listing', 'title wasteType weight imageUrl')
    .populate('buyer', 'name location')
    .populate('seller', 'name location')
    .sort({ createdAt: -1 });
};

// Static method to get platform statistics
simpleTransactionSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalValue: { $sum: '$agreedPrice' },
        completedValue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$agreedPrice', 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalTransactions: 0,
    completedTransactions: 0,
    totalValue: 0,
    completedValue: 0
  };
};

// Static method to get most traded waste types
simpleTransactionSchema.statics.getMostTradedWasteTypes = async function() {
  const stats = await this.aggregate([
    {
      $match: { status: 'completed' }
    },
    {
      $lookup: {
        from: 'listings',
        localField: 'listing',
        foreignField: '_id',
        as: 'listingInfo'
      }
    },
    {
      $unwind: '$listingInfo'
    },
    {
      $group: {
        _id: '$listingInfo.wasteType',
        count: { $sum: 1 },
        totalWeight: { $sum: '$listingInfo.weight' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('SimpleTransaction', simpleTransactionSchema);
