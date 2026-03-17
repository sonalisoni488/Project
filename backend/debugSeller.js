const mongoose = require('mongoose');
const BuyerRequest = require('./models/BuyerRequest');
const User = require('./models/User');
require('dotenv').config();

async function debugSellerRequests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get all sellers
    const sellers = await User.find({ role: 'seller' });
    console.log('📋 All sellers:');
    sellers.forEach(seller => {
      console.log(`- ${seller.name} (${seller.email}) - ID: ${seller._id}`);
    });

    // Get all buyer requests without populate first
    const requests = await BuyerRequest.find({});
    
    console.log('\n📋 All buyer requests:');
    requests.forEach(request => {
      console.log(`- Request ID: ${request._id}`);
      console.log(`  Seller ID: ${request.sellerId}`);
      console.log(`  Buyer: ${request.buyerName} (${request.buyerEmail})`);
      console.log(`  Listing ID: ${request.listingId}`);
      console.log(`  Offer: $${request.offerPrice}`);
      console.log(`  Status: ${request.status}`);
      console.log('---');
    });

    // Test query for each seller
    console.log('\n🔍 Testing queries for each seller:');
    for (const seller of sellers) {
      const sellerRequests = await BuyerRequest.find({ sellerId: seller._id });
      
      console.log(`\nSeller ${seller.name} (${seller._id}):`);
      console.log(`  Requests found: ${sellerRequests.length}`);
      sellerRequests.forEach(req => {
        console.log(`    - ${req.buyerName}: $${req.offerPrice} for listing ${req.listingId}`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugSellerRequests();
