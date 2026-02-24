const mongoose = require('mongoose');

const wasteListingSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  wasteType: {
    type: String,
    enum: ['Plastic', 'Metal', 'Paper', 'Textile', 'E-waste', 'Construction', 'Glass', 'Organic'],
    required: [true, 'Waste type is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0.1, 'Weight must be at least 0.1 kg'],
    max: [1000, 'Weight cannot exceed 1000 kg']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image is required']
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 100,
    required: [true, 'AI confidence score is required']
  },
  suggestedPrice: {
    type: Number,
    required: [true, 'Suggested price is required'],
    min: [0, 'Price cannot be negative']
  },
  finalPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'cancelled'],
    default: 'available'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  pickupAvailable: {
    type: Boolean,
    default: true
  },
  deliveryAvailable: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  interestedBuyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Index for efficient queries
wasteListingSchema.index({ wasteType: 1, status: 1 });
wasteListingSchema.index({ location: 1 });
wasteListingSchema.index({ sellerId: 1 });
wasteListingSchema.index({ createdAt: -1 });
wasteListingSchema.index({ finalPrice: 1 });

// Virtual for checking if listing is expired
wasteListingSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to increment view count
wasteListingSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add interested buyer
wasteListingSchema.methods.addInterestedBuyer = function(buyerId) {
  if (!this.interestedBuyers.includes(buyerId)) {
    this.interestedBuyers.push(buyerId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove interested buyer
wasteListingSchema.methods.removeInterestedBuyer = function(buyerId) {
  this.interestedBuyers = this.interestedBuyers.filter(id => !id.equals(buyerId));
  return this.save();
};

// Pre-save middleware to set finalPrice if not provided
wasteListingSchema.pre('save', function(next) {
  if (this.isNew && !this.finalPrice) {
    this.finalPrice = this.suggestedPrice;
  }
  next();
});

// Static method to get listings by waste type
wasteListingSchema.statics.getByWasteType = function(wasteType) {
  return this.find({ wasteType, status: 'available' })
    .populate('sellerId', 'name location rating')
    .sort({ createdAt: -1 });
};

// Static method to search listings
wasteListingSchema.statics.search = function(query) {
  const {
    wasteType,
    location,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    condition
  } = query;

  const searchQuery = { status: 'available' };

  if (wasteType) searchQuery.wasteType = wasteType;
  if (location) searchQuery.location = new RegExp(location, 'i');
  if (condition) searchQuery.condition = condition;

  if (minPrice || maxPrice) {
    searchQuery.finalPrice = {};
    if (minPrice) searchQuery.finalPrice.$gte = minPrice;
    if (maxPrice) searchQuery.finalPrice.$lte = maxPrice;
  }

  if (minWeight || maxWeight) {
    searchQuery.weight = {};
    if (minWeight) searchQuery.weight.$gte = minWeight;
    if (maxWeight) searchQuery.weight.$lte = maxWeight;
  }

  return this.find(searchQuery)
    .populate('sellerId', 'name location rating')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('WasteListing', wasteListingSchema);
