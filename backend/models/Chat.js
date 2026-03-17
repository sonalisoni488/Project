const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

const chatSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  request: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    unique: true  // Ensure one chat per request
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ participants: 1 });
chatSchema.index({ request: 1 });
chatSchema.index({ status: 1 });

module.exports = mongoose.model('Chat', chatSchema);
