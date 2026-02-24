const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteListing',
    required: [true, 'Listing ID is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital_wallet', 'on_delivery'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  pickupDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  pickupAddress: {
    type: String,
    required: [true, 'Pickup address is required']
  },
  deliveryAddress: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  carbonSaved: {
    type: Number, // in kg CO2
    default: 0
  },
  landfillReduction: {
    type: Number, // in kg
    default: 0
  },
  buyerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  sellerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  buyerReview: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  sellerReview: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  disputeReason: {
    type: String
  },
  disputeResolved: {
    type: Boolean,
    default: false
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ buyerId: 1 });
transactionSchema.index({ sellerId: 1 });
transactionSchema.index({ listingId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for checking if transaction can be cancelled
transactionSchema.virtual('canBeCancelled').get(function() {
  return this.status === 'pending' || this.status === 'confirmed';
});

// Virtual for transaction completion time
transactionSchema.virtual('completionTime').get(function() {
  if (this.status === 'completed' && this.updatedAt) {
    return this.updatedAt - this.createdAt;
  }
  return null;
});

// Pre-save middleware to calculate environmental impact
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Get the listing to calculate environmental impact
    try {
      const WasteListing = mongoose.model('WasteListing');
      const listing = await WasteListing.findById(this.listingId);
      
      if (listing) {
        // Calculate carbon saved based on waste type (simplified calculation)
        const carbonFactors = {
          'Plastic': 2.5,
          'Metal': 3.0,
          'Paper': 1.5,
          'Textile': 2.0,
          'E-waste': 4.0,
          'Construction': 1.0,
          'Glass': 0.8,
          'Organic': 0.5
        };
        
        const factor = carbonFactors[listing.wasteType] || 1.0;
        this.carbonSaved = listing.weight * factor;
        this.landfillReduction = listing.weight;
      }
    } catch (error) {
      console.error('Error calculating environmental impact:', error);
    }
  }
  next();
});

// Post-save middleware to update listing status
transactionSchema.post('save', async function() {
  try {
    const WasteListing = mongoose.model('WasteListing');
    
    if (this.status === 'completed') {
      await WasteListing.findByIdAndUpdate(this.listingId, { status: 'sold' });
    } else if (this.status === 'cancelled') {
      await WasteListing.findByIdAndUpdate(this.listingId, { status: 'available' });
    } else if (this.status === 'confirmed') {
      await WasteListing.findByIdAndUpdate(this.listingId, { status: 'pending' });
    }
  } catch (error) {
    console.error('Error updating listing status:', error);
  }
});

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
      $lte: endDate || new Date()
    }
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalRevenue: { $sum: '$price' },
        totalCarbonSaved: { $sum: '$carbonSaved' },
        totalLandfillReduction: { $sum: '$landfillReduction' },
        averageTransactionValue: { $avg: '$price' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalTransactions: 0,
    totalRevenue: 0,
    totalCarbonSaved: 0,
    totalLandfillReduction: 0,
    averageTransactionValue: 0,
    completedTransactions: 0
  };
};

// Static method to get user transaction history
transactionSchema.statics.getUserTransactions = function(userId, role = 'buyer') {
  const matchField = role === 'buyer' ? 'buyerId' : 'sellerId';
  
  return this.find({ [matchField]: userId })
    .populate('listingId', 'wasteType weight imageUrl')
    .populate(role === 'buyer' ? 'sellerId' : 'buyerId', 'name location rating')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Transaction', transactionSchema);
