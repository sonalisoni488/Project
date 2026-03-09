const mongoose = require('mongoose');
const { upload } = require('../config/cloudinary');
const WasteListing = require('../models/WasteListing');

// @desc    Get seller dashboard data
// @route   GET /api/seller/dashboard
// @access  Private (seller only)
const getDashboardData = async (req, res) => {
  try {
    // This would typically aggregate data from listings and transactions
    // For now, returning mock data
    const dashboardData = {
      totalListings: 12,
      totalSales: 8,
      revenue: 2450.00,
      buyerOffers: 5,
      recentSales: [
        { id: 1, item: 'Plastic Bottles', amount: 150, date: '2026-02-27' },
        { id: 2, item: 'Metal Scrap', amount: 200, date: '2026-02-26' }
      ]
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
};

// @desc    Get seller's waste listings
// @route   GET /api/seller/listings
// @access  Private (seller only)
const getListings = async (req, res) => {
  try {
    const listings = await WasteListing.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching listings'
    });
  }
};

// @desc    Create new waste listing
// @route   POST /api/seller/listings
// @access  Private (seller only)
const createListing = async (req, res) => {
  try {
    console.log('📝 Creating new listing...');
    console.log('👤 User ID:', req.user?.id);
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body:', req.body);
    console.log('📋 Request file:', req.file);
    console.log('📸 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file uploaded');
    
    // Extract fields with exact names from frontend
    const { category, quantity, expectedPrice, description, location } = req.body;

    // Validate all required fields
    if (!category || !quantity || !expectedPrice || !description || !location) {
      console.log('❌ Validation failed:', { category, quantity, expectedPrice, description, location });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate weight limits
    const weightValue = Number(quantity);
    if (weightValue > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Weight cannot exceed 1000 kg. Please enter a value between 0.1 and 1000 kg.'
      });
    }

    // Handle image upload
    let imageUrl = '/placeholder-image.jpg';
    if (req.file) {
      // Handle both Cloudinary and local storage
      if (req.file.path && req.file.path.startsWith('http')) {
        // Cloudinary URL
        imageUrl = req.file.path;
        console.log('📸 Image uploaded to Cloudinary:', imageUrl);
        console.log('📁 Cloudinary folder check - URL contains folder?', imageUrl.includes('waste2resource'));
      } else if (req.file.filename) {
        // Local storage
        imageUrl = `/uploads/${req.file.filename}`;
        console.log('📁 Image saved locally:', imageUrl);
      }
      
      // Debug: Show full file object
      console.log('🔍 Full file object:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        path: req.file.path,
        filename: req.file.filename,
        url: req.file.url,
        secure_url: req.file.secure_url
      });
    }

    // Convert lowercase category to proper enum value
    let capitalizedCategory;
    if (category.toLowerCase() === 'e-waste' || category.toLowerCase() === 'ewaste') {
      capitalizedCategory = 'E-waste'; // Special case for E-waste (handle both 'ewaste' and 'e-waste')
    } else {
      capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    }
    console.log('🔄 Converting category:', category, '->', capitalizedCategory);

    // Create new listing with mapped fields
    const newListing = new WasteListing({
      sellerId: req.user.id,
      title: category,                    // title → category
      wasteType: capitalizedCategory,     // wasteType → category (proper enum format)
      weight: Number(quantity),            // weight → quantity (convert to Number)
      price: Number(expectedPrice),          // price → expectedPrice (convert to Number)
      suggestedPrice: Number(expectedPrice), // suggestedPrice required field
      aiConfidence: 95,                  // aiConfidence required field
      description,
      imageUrl: imageUrl,                  // imageUrl → from req.file
      location,
      status: "available"
    });

    await newListing.save();

    res.status(201).json({
      success: true,
      data: newListing,
      message: "Listing created successfully"
    });

  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Update waste listing
// @route   PUT /api/seller/listings/:id
// @access  Private (seller only)
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, quantity, expectedPrice, description, location } = req.body;

    // Find and update listing with field mapping
    const updateData = {};
    if (category) {
      updateData.title = category;           // Convert lowercase category to proper enum value
      let capitalizedCategory;
      if (category.toLowerCase() === 'e-waste' || category.toLowerCase() === 'ewaste') {
        capitalizedCategory = 'E-waste'; // Special case for E-waste (handle both 'ewaste' and 'e-waste')
      } else {
        capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      }
      console.log('🔄 Converting category:', category, '->', capitalizedCategory);
      updateData.wasteType = capitalizedCategory;
    }
    if (quantity) updateData.weight = Number(quantity);      // weight → quantity (convert to Number)
    if (expectedPrice) {
      updateData.price = Number(expectedPrice); // price → expectedPrice (convert to Number)
      updateData.suggestedPrice = Number(expectedPrice); // suggestedPrice required field
    }
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (req.file) {
      // Handle both Cloudinary and local storage
      if (req.file.path && req.file.path.startsWith('http')) {
        // Cloudinary URL
        updateData.imageUrl = req.file.path;
        console.log('📸 Image updated to Cloudinary:', req.file.path);
      } else if (req.file.filename) {
        // Local storage
        updateData.imageUrl = `/uploads/${req.file.filename}`;
        console.log('📁 Image updated locally:', `/uploads/${req.file.filename}`);
      }
    }

    const updatedListing = await WasteListing.findOneAndUpdate(
      { _id: id, sellerId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or unauthorized'
      });
    }

    console.log('✅ Listing updated successfully:', updatedListing._id);

    res.status(200).json({
      success: true,
      data: updatedListing,
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating listing: ' + error.message
    });
  }
};

// @desc    Delete waste listing
// @route   DELETE /api/seller/listings/:id
// @access  Private (seller only)
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedListing = await WasteListing.findOneAndDelete({
      _id: id,
      sellerId: req.user.id
    });

    if (!deletedListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting listing'
    });
  }
};

module.exports = {
  getDashboardData,
  getListings,
  createListing,
  updateListing,
  deleteListing
};
