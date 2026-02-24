const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  wasteType: {
    type: String,
    enum: ['Plastic', 'Paper', 'Metal', 'Textile', 'E-waste', 'Construction'],
    required: [true, 'Waste type is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0.1, 'Weight must be at least 0.1 kg'],
    max: [1000, 'Weight cannot exceed 1000 kg']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
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
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
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
listingSchema.index({ wasteType: 1, status: 1 });
listingSchema.index({ location: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ price: 1 });

// Static method to search listings
listingSchema.statics.search = function(query) {
  const {
    wasteType,
    location,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10
  } = query;

  const searchQuery = { status: 'available' };

  if (wasteType) searchQuery.wasteType = wasteType;
  if (location) searchQuery.location = new RegExp(location, 'i');

  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }

  return this.find(searchQuery)
    .populate('seller', 'name location')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get listing count for search
listingSchema.statics.countSearch = function(query) {
  const {
    wasteType,
    location,
    minPrice,
    maxPrice
  } = query;

  const searchQuery = { status: 'available' };

  if (wasteType) searchQuery.wasteType = wasteType;
  if (location) searchQuery.location = new RegExp(location, 'i');

  if (minPrice || maxPrice) {
    searchQuery.price = {};
    if (minPrice) searchQuery.price.$gte = minPrice;
    if (maxPrice) searchQuery.price.$lte = maxPrice;
  }

  return this.countDocuments(searchQuery);
};

module.exports = mongoose.model('Listing', listingSchema);
