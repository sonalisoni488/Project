const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testRequestEndpoint() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('✅ Connected to MongoDB');

    // Find a buyer user
    const buyer = await User.findOne({ role: 'buyer' });
    
    if (!buyer) {
      console.log('❌ No buyer found');
      return;
    }

    console.log('🔍 Testing Request Endpoint with Token...');
    console.log('Buyer:', buyer.name, 'ID:', buyer._id);

    // Create a JWT token for the buyer
    const token = jwt.sign(
      { id: buyer._id, email: buyer.email, role: buyer.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('✅ Token created for testing');
    console.log('📋 Test token:', token.substring(0, 50) + '...');

    // Test the endpoint with curl-like command
    const testPayload = {
      listingId: '69b3cda70880eba534d7c8b9', // Use a valid listing ID
      message: 'Test request from endpoint test'
    };

    console.log('📝 Test payload:', testPayload);
    console.log('🔗 Endpoint: POST http://localhost:5002/api/requests');
    console.log('🔑 Authorization: Bearer ' + token.substring(0, 20) + '...');

    // You can test this manually with:
    console.log('\n🧪 Manual Test Command:');
    console.log('curl -X POST http://localhost:5002/api/requests \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer ' + token + '" \\');
    console.log('  -d \'' + JSON.stringify(testPayload) + '\'');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRequestEndpoint();
