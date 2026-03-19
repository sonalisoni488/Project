const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const favoriteController = require('../controllers/favoriteController');

// Protect all routes
router.use(protect);

// Add to favorites
router.post('/', favoriteController.addToFavorites);

// Remove from favorites
router.delete('/:listingId', favoriteController.removeFromFavorites);

// Check if listing is favorited
router.get('/check/:listingId', favoriteController.checkFavoriteStatus);

// Get user's favorites
router.get('/', favoriteController.getUserFavorites);

module.exports = router;
