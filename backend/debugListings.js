const mongoose = require('mongoose');
const Listing = require('./models/Listing');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/waste2resource', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Test 1: Check if Listing model works
    console.log('\n=== Testing Listing Model ===');
    const allListings = await Listing.find({});
    console.log('Total listings found:', allListings.length);
    
    if (allListings.length > 0) {
      console.log('Sample listing structure:');
      const sample = allListings[0];
      console.log('- ID:', sample._id);
      console.log('- Title:', sample.title);
      console.log('- Seller ID:', sample.seller);
      console.log('- Seller type:', typeof sample.seller);
    }
    
    // Test 2: Check if we can query by seller ID
    console.log('\n=== Testing Query by Seller ===');
    if (allListings.length > 0) {
      const sellerId = allListings[0].seller;
      console.log('Testing with seller ID:', sellerId);
      
      const sellerListings = await Listing.find({ seller: sellerId });
      console.log('Listings for this seller:', sellerListings.length);
    }
    
    // Test 3: Check if there are any sellers in User collection
    console.log('\n=== Testing User Collection ===');
    const User = require('./models/User');
    const sellers = await User.find({ role: 'seller' });
    console.log('Total sellers:', sellers.length);
    
    if (sellers.length > 0) {
      console.log('Sample seller:');
      console.log('- ID:', sellers[0]._id);
      console.log('- Name:', sellers[0].name);
      console.log('- Role:', sellers[0].role);
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
