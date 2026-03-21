const Chat = require('../models/Chat');
const Request = require('../models/Request');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create chat when request is created
// @route   Internal - called by requestController
// @access   Private
const createChatForRequest = async (requestId, buyerId, sellerId, listingId, message) => {
  try {
    console.log('🔍 Creating chat for request:', requestId);

    // Check if chat already exists for this request
    const existingChat = await Chat.findOne({ request: requestId });
    if (existingChat) {
      console.log('⚠️ Chat already exists for request:', requestId);
      return existingChat;
    }

    // Create new chat
    const chat = new Chat({
      participants: [buyerId, sellerId],
      listing: listingId,
      request: requestId,
      messages: [{
        sender: buyerId,
        text: message || "Interested in your listing",
        createdAt: new Date()
      }],
      status: 'active',
      lastMessage: message || "Interested in your listing",
      lastMessageAt: new Date()
    });

    const savedChat = await chat.save();
    console.log('✅ Chat created successfully:', savedChat._id);
    
    return savedChat;
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    throw error;
  }
};

// @desc    Get all chats for logged-in user
// @route   GET /api/chats
// @access   Private
const getUserChats = async (req, res) => {
  try {
    console.log('🔍 Fetching chats for user:', req.user.id);
    
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name email')
    .populate('listing', 'title imageUrl')
    .populate('request', 'status')
    .sort({ updatedAt: -1 });

    console.log('✅ Chats fetched:', chats.length);
    
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
};

// @desc    Get single chat with messages
// @route   GET /api/chats/:id
// @access   Private
const getChatById = async (req, res) => {
  try {
    console.log('🔍 Fetching chat:', req.params.id);
    
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email')
      .populate('listing', 'title imageUrl description')
      .populate('messages.sender', 'name email')
      .sort({ 'messages.createdAt': 1 });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this chat.'
      });
    }

    console.log('✅ Chat fetched successfully');
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('❌ Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat'
    });
  }
};

// @desc    Send message in chat
// @route   POST /api/chats/message
// @access   Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    
    if (!chatId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message are required'
      });
    }

    console.log('🔍 Sending message to chat:', chatId);

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this chat.'
      });
    }

    // Add new message
    const newMessage = {
      sender: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();
    chat.updatedAt = new Date();

    await chat.save();
    console.log('✅ Message sent successfully');

    // Get other participants to notify them
    const otherParticipants = chat.participants.filter(
      participant => participant.toString() !== req.user.id
    );

    // Create notifications for other participants
    for (const participant of otherParticipants) {
      // Get sender role (buyer or seller)
      const senderUser = await User.findById(req.user.id);
      const senderRole = senderUser.role || 'user';
      
      await createNotification(
        participant,
        'message',
        'New Message Received',
        `New message from ${senderUser.name}`,
        chat._id,
        'chat',
        req.user.id,
        senderRole
      );
    }

    // Populate sender info for response
    await chat.populate('messages.sender', 'name email');

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: chat._id,
        message: chat.messages[chat.messages.length - 1]
      }
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};

// @desc    Close chat
// @route   PUT /api/chats/:id/close
// @access   Private
const closeChat = async (req, res) => {
  try {
    const { chatId } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this chat.'
      });
    }

    chat.status = 'closed';
    await chat.save();
    console.log('✅ Chat closed successfully');

    res.json({
      success: true,
      message: 'Chat closed successfully'
    });
  } catch (error) {
    console.error('❌ Error closing chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while closing chat'
    });
  }
};

module.exports = {
  createChatForRequest,
  getUserChats,
  getChatById,
  sendMessage,
  closeChat
};
