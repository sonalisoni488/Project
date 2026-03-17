const mongoose = require('mongoose');
const BuyerRequest = require('./models/BuyerRequest');
const User = require('./models/User');
require('dotenv').config();

async function testAPIEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get seller "noah" (the one with requests)
    const seller = await User.findOne({ email: 'noah@resource.com' });
    
    if (!seller) {
      console.log('❌ Seller noah not found');
      return;
    }

    console.log('🔍 Testing API call for seller:', seller.name, 'ID:', seller._id);

    // Simulate the API call
    const receivedRequests = await BuyerRequest.find({ sellerId: seller._id })
      .populate('listingId', 'title wasteType price imageUrl')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ API response would be:');
    console.log(JSON.stringify({
      success: true,
      data: receivedRequests
    }, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPIEndpoint();
