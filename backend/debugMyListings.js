const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/waste2resource', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find a seller user
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('No seller found in database');
      process.exit(1);
    }
    
    console.log('Found seller:', seller.name, seller.email);
    console.log('Seller ID:', seller._id);
    console.log('Seller ID type:', typeof seller._id);
    
    // Simulate what the API endpoint does
    console.log('\n=== Simulating API Query ===');
    
    // Build query exactly like the API
    const query = { seller: seller._id };
    console.log('Query object:', query);
    console.log('Query seller field type:', typeof query.seller);
    
    // Get total count
    const total = await Listing.countDocuments(query);
    console.log('Total listings found:', total);
    
    // Get listings
    const listings = await Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('Listings array length:', listings.length);
    
    if (listings.length > 0) {
      console.log('First listing:');
      console.log('- Title:', listings[0].title);
      console.log('- Seller ID:', listings[0].seller);
      console.log('- Seller ID type:', typeof listings[0].seller);
      console.log('- IDs match:', listings[0].seller.toString() === seller._id.toString());
    }
    
    // Test the exact response structure
    const response = {
      success: true,
      data: {
        listings,
        pagination: {
          page: 1,
          limit: 10,
          total,
          pages: Math.ceil(total / 10)
        }
      }
    };
    
    console.log('\n=== API Response Structure ===');
    console.log('Response keys:', Object.keys(response));
    console.log('Data keys:', Object.keys(response.data));
    console.log('Listings in response:', response.data.listings.length);
    
  } catch (error) {
    console.error('Error during testing:', error);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
