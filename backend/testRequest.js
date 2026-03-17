const mongoose = require('mongoose');
const BuyerRequest = require('./models/BuyerRequest');
const User = require('./models/User');
const Listing = require('./models/Listing');
require('dotenv').config();

async function testBuyerRequest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get a sample seller and listing
    const seller = await User.findOne({ role: 'seller' });
    const listing = await Listing.findOne({ seller: seller?._id });
    
    if (!seller || !listing) {
      console.log('No seller or listing found');
      return;
    }

    console.log('Seller:', seller.name, 'ID:', seller._id);
    console.log('Listing:', listing.title, 'ID:', listing._id);

    // Create a test buyer request
    const testRequest = new BuyerRequest({
      listingId: listing._id,
      sellerId: seller._id,
      buyerId: new mongoose.Types.ObjectId(), // Test buyer ID
      buyerName: 'Test Buyer',
      buyerEmail: 'test@example.com',
      message: 'I am interested in this product',
      offerPrice: 100,
      status: 'pending',
      createdAt: new Date()
    });

    await testRequest.save();
    console.log('✅ Test buyer request created:', testRequest._id);

    // Fetch requests for seller
    const receivedRequests = await BuyerRequest.find({ sellerId: seller._id })
      .populate('listingId', 'title wasteType price imageUrl')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    console.log('📋 Received requests for seller:', receivedRequests.length);
    receivedRequests.forEach(req => {
      console.log(`- ${req.buyerName}: ${req.offerPrice} for ${req.listingId?.title}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBuyerRequest();
