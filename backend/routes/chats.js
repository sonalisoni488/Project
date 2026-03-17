const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Import controller
const {
  getUserChats,
  getChatById,
  sendMessage,
  closeChat
} = require('../controllers/chatController');

// Apply authentication to all routes
router.use(protect);

// @route   GET /api/chats
// @desc    Get all chats for logged-in user
// @access   Private
router.get('/', async (req, res) => {
  try {
    const result = await getUserChats(req, res);
    return;
  } catch (error) {
    // Error is handled in controller
  }
});

// @route   GET /api/chats/:id
// @desc    Get single chat with messages
// @access   Private
router.get('/:id', async (req, res) => {
  try {
    const result = await getChatById(req, res);
    return;
  } catch (error) {
    // Error is handled in controller
  }
});

// @route   POST /api/chats/message
// @desc    Send message in chat
// @access   Private
router.post('/message', async (req, res) => {
  try {
    const result = await sendMessage(req, res);
    return;
  } catch (error) {
    // Error is handled in controller
  }
});

// @route   PUT /api/chats/:id/close
// @desc    Close chat
// @access   Private
router.put('/:id/close', async (req, res) => {
  try {
    const result = await closeChat(req, res);
    return;
  } catch (error) {
    // Error is handled in controller
  }
});

module.exports = router;
