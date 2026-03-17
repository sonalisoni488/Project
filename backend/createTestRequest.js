const mongoose = require('mongoose');
const BuyerRequest = require('./models/BuyerRequest');
const User = require('./models/User');
const Listing = require('./models/Listing');
require('dotenv').config();

async function createTestRequest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get the seller "john" (who might be logged in)
    const seller = await User.findOne({ email: 'john@resource.com' });
    
    if (!seller) {
      console.log('❌ Seller john not found');
      return;
    }

    // Get a listing for this seller
    const listing = await Listing.findOne({ seller: seller._id });
    
    if (!listing) {
      console.log('❌ No listing found for seller john');
      return;
    }

    console.log('🔍 Creating test request for seller:', seller.name);
    console.log('🔍 Listing:', listing.title);

    // Create a test buyer request
    const testRequest = new BuyerRequest({
      listingId: listing._id,
      sellerId: seller._id,
      buyerId: new mongoose.Types.ObjectId(), // Test buyer ID
      buyerName: 'Test Buyer',
      buyerEmail: 'testbuyer@example.com',
      message: 'I am interested in purchasing this product. Please contact me.',
      offerPrice: 150,
      status: 'pending',
      createdAt: new Date()
    });

    await testRequest.save();
    console.log('✅ Test buyer request created successfully!');
    console.log('📋 Request details:');
    console.log(`  - Buyer: ${testRequest.buyerName} (${testRequest.buyerEmail})`);
    console.log(`  - Offer: $${testRequest.offerPrice}`);
    console.log(`  - Listing: ${listing.title}`);
    console.log(`  - Seller: ${seller.name}`);

    // Verify the request can be fetched
    const fetchedRequests = await BuyerRequest.find({ sellerId: seller._id })
      .populate('listingId', 'title')
      .populate('buyerId', 'name email');
    
    console.log(`\n✅ Verification: Found ${fetchedRequests.length} requests for seller ${seller.name}`);
    fetchedRequests.forEach(req => {
      console.log(`  - ${req.buyerName}: $${req.offerPrice} for ${req.listingId?.title}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestRequest();
