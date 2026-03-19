const Favorite = require('../models/Favorite');
const mongoose = require('mongoose');

// Add to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user.id;

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: userId,
      listing: listingId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Listing already in favorites'
      });
    }

    // Create new favorite
    const favorite = new Favorite({
      user: userId,
      listing: listingId
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: favorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites'
    });
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      listing: listingId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites'
    });
  }
};

// Check if listing is favorited
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      user: userId,
      listing: listingId
    });

    res.json({
      success: true,
      isFavorited: !!favorite
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status'
    });
  }
};

// Get user's favorites
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'listing',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: favorites.map(fav => fav.listing)
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites'
    });
  }
};
