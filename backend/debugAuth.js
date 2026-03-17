const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get all users and their roles
    const users = await User.find({});
    console.log('📋 All users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user._id}`);
    });

    // Check specifically for sellers
    const sellers = await User.find({ role: 'seller' });
    console.log('\n🏪 Sellers only:');
    sellers.forEach(seller => {
      console.log(`- ${seller.name} (${seller.email}) - ID: ${seller._id}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAuth();
