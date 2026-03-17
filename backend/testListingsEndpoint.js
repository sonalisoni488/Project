const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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
    
    // Generate JWT token for the seller
    const token = jwt.sign(
      { id: seller._id, email: seller.email, role: seller.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('\n=== Generated JWT Token ===');
    console.log('Token:', token);
    console.log('User ID:', seller._id);
    console.log('Role:', seller.role);
    
    // Test the API endpoint
    console.log('\n=== Testing API Endpoint ===');
    console.log('Use this curl command to test the endpoint:');
    console.log(`curl -X GET http://localhost:5002/api/listings/my -H "Authorization: Bearer ${token}"`);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
