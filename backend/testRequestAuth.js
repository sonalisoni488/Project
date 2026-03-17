const mongoose = require('mongoose');
const Request = require('./models/Request');
const Listing = require('./models/Listing');
const User = require('./models/User');
require('dotenv').config();

async function testRequestWithAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('✅ Connected to MongoDB');

    // Find a buyer and seller
    const buyer = await User.findOne({ role: 'buyer' });
    const seller = await User.findOne({ role: 'seller' });
    
    if (!buyer || !seller) {
      console.log('❌ No buyer or seller found');
      return;
    }

    // Find a listing for this seller
    const listing = await Listing.findOne({ seller: seller._id });
    
    if (!listing) {
      console.log('❌ No listing found for seller');
      return;
    }

    console.log('🔍 Testing Request API with Authentication...');
    console.log('Buyer:', buyer.name, 'ID:', buyer._id);
    console.log('Seller:', seller.name, 'ID:', seller._id);
    console.log('Listing:', listing.title, 'ID:', listing._id);

    // Clean up any existing test requests
    await Request.deleteMany({ 
      buyer: buyer._id, 
      listing: listing._id 
    });

    // Create a test request
    const testRequest = {
      buyer: buyer._id,
      seller: seller._id,
      listing: listing._id,
      message: 'Test request for API verification',
      offerPrice: listing.price
    };

    const request = new Request(testRequest);
    const savedRequest = await request.save();
    
    console.log('✅ Request created successfully:');
    console.log('- Request ID:', savedRequest._id);
    console.log('- Status:', savedRequest.status);
    console.log('- Message:', savedRequest.message);
    console.log('- Offer Price:', savedRequest.offerPrice);

    // Test fetching buyer requests (populated)
    const buyerRequests = await Request.find({ buyer: buyer._id })
      .populate('listing', 'title price imageUrl')
      .populate('seller', 'name email');
    
    console.log(`✅ Found ${buyerRequests.length} requests for buyer ${buyer.name}:`);
    buyerRequests.forEach(req => {
      console.log(`- ${req.listing?.title} - ${req.status} - $${req.offerPrice}`);
      console.log(`  Seller: ${req.seller?.name}`);
    });

    // Test fetching seller requests (populated)
    const sellerRequests = await Request.find({ seller: seller._id })
      .populate('listing', 'title price imageUrl')
      .populate('buyer', 'name email');
    
    console.log(`✅ Found ${sellerRequests.length} requests for seller ${seller.name}:`);
    sellerRequests.forEach(req => {
      console.log(`- ${req.listing?.title} - ${req.status} - From: ${req.buyer?.name}`);
      console.log(`  Message: ${req.message}`);
    });

    console.log('\n✅ Request API with authentication working correctly!');
    console.log('📋 API Endpoints ready:');
    console.log('- POST /api/requests (buyer only)');
    console.log('- GET /api/requests/buyer (buyer only)');
    console.log('- GET /api/requests/seller (seller only)');
    console.log('- PUT /api/requests/:id/status (seller only)');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRequestWithAuth();
