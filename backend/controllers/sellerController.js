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
    console.log("Request Body:", req.body);

    const { title, wasteType, weight, price, description, location } = req.body;

    if (!title || !wasteType || !weight || !price || !description || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    let imageUrl = "/placeholder-image.jpg";

    if (req.file) {
      if (req.file.path && req.file.path.startsWith("http")) {
        imageUrl = req.file.path;
      } else if (req.file.filename) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const newListing = await WasteListing.create({
      seller: req.user.id,   // ✅ correct field name
      title,
      wasteType,
      weight: parseFloat(weight),
      price: parseFloat(price),  // ✅ correct field
      description,
      imageUrl,
      location,
      status: "available"
    });

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

    // Find and update listing
    const updateData = {};
    if (category) updateData.wasteType = category;
    if (quantity) updateData.weight = parseFloat(quantity);
    if (expectedPrice) updateData.finalPrice = parseFloat(expectedPrice);
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
