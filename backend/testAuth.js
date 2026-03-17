const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Test the authorize function
const { authorize } = require('./middleware/simpleAuth');

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get seller john
    const seller = await User.findOne({ email: 'john@resource.com' });
    
    if (!seller) {
      console.log('❌ Seller john not found');
      return;
    }

    console.log('🔍 Testing authorization for seller:', seller.name, 'Role:', seller.role);

    // Create mock request object
    const mockReq = {
      user: seller
    };

    // Create mock response object
    let responseData = null;
    let statusCode = null;
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          }
        };
      }
    };

    // Test the authorize function
    const authorizeSeller = authorize('seller');
    
    authorizeSeller(mockReq, mockRes, () => {
      console.log('✅ Authorization successful - next() called');
    });

    if (statusCode === 403) {
      console.log('❌ Authorization failed:', responseData);
    } else if (responseData === null && statusCode === null) {
      console.log('✅ Authorization passed - no error triggered');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAuth();
