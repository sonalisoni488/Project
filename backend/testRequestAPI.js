const mongoose = require('mongoose');
const Request = require('./models/Request');
const Listing = require('./models/Listing');
const User = require('./models/User');
require('dotenv').config();

async function testRequestAPI() {
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

    console.log('🔍 Testing Request API...');
    console.log('Buyer:', buyer.name, 'ID:', buyer._id);
    console.log('Seller:', seller.name, 'ID:', seller._id);
    console.log('Listing:', listing.title, 'ID:', listing._id);

    // Test creating a request
    console.log('\n📝 Testing request creation...');
    const testRequest = {
      buyer: buyer._id,
      seller: seller._id,
      listing: listing._id,
      message: 'I am interested in this listing. Please provide more details.',
      offerPrice: listing.price
    };

    const request = new Request(testRequest);
    const savedRequest = await request.save();
    
    console.log('✅ Request created successfully:');
    console.log('- Request ID:', savedRequest._id);
    console.log('- Status:', savedRequest.status);
    console.log('- Message:', savedRequest.message);
    console.log('- Offer Price:', savedRequest.offerPrice);

    // Test fetching buyer requests
    console.log('\n🔍 Testing buyer requests fetch...');
    const buyerRequests = await Request.find({ buyer: buyer._id })
      .populate('listing', 'title price')
      .populate('seller', 'name email');
    
    console.log(`✅ Found ${buyerRequests.length} requests for buyer ${buyer.name}:`);
    buyerRequests.forEach(req => {
      console.log(`- ${req.listing?.title} - ${req.status} - $${req.offerPrice}`);
    });

    // Test fetching seller requests
    console.log('\n🔍 Testing seller requests fetch...');
    const sellerRequests = await Request.find({ seller: seller._id })
      .populate('listing', 'title price')
      .populate('buyer', 'name email');
    
    console.log(`✅ Found ${sellerRequests.length} requests for seller ${seller.name}:`);
    sellerRequests.forEach(req => {
      console.log(`- ${req.listing?.title} - ${req.status} - From: ${req.buyer?.name}`);
    });

    // Test updating request status
    console.log('\n🔄 Testing request status update...');
    await Request.findByIdAndUpdate(savedRequest._id, {
      status: 'accepted',
      responseMessage: 'Great! We can proceed with this request.'
    });
    
    const updatedRequest = await Request.findById(savedRequest._id);
    console.log('✅ Request status updated:', updatedRequest.status);
    console.log('✅ Response message:', updatedRequest.responseMessage);

    await mongoose.connection.close();
    console.log('\n✅ Request API test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRequestAPI();
