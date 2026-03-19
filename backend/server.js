const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/simpleListings');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const sellerRoutes = require('./routes/seller');
const buyerRoutes = require('./routes/buyer');
const orderRoutes = require('./routes/orders');
const requestRoutes = require('./routes/requests');
const chatRoutes = require('./routes/chats');

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Static files
app.use('/uploads', express.static('uploads'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource')
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database: waste2resource');
  console.log('🔗 Connection: mongodb://localhost:27017/waste2resource');
  console.log('💡 You can connect with MongoDB Compass using: mongodb://localhost:27017/waste2resource');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
  console.log('💡 You can start MongoDB with: mongod');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Waste2Resource API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Create HTTP server and setup Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
});

// Make io globally available
global.io = io;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected to notifications:', socket.id);
  
  // Join user to their personal room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from notifications:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Socket.io server started for real-time notifications');
});
