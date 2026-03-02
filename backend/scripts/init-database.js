const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('✅ Connected to MongoDB successfully!');

    // Create indexes for better performance
    console.log('📊 Creating indexes...');

    // User indexes
    await User.createIndexes([
      { email: 1 }, // Unique index for email
      { role: 1 },
      { location: 1 },
      { rating: -1 },
      { isActive: 1 }
    ]);
    console.log('✅ User indexes created');

    // Listing indexes
    await Listing.createIndexes([
      { seller: 1 },
      { category: 1 },
      { wasteType: 1 },
      { location: 1 },
      { price: 1 },
      { weight: 1 },
      { status: 1 },
      { createdAt: -1 },
      { title: 'text', description: 'text' } // Text search index
    ]);
    console.log('✅ Listing indexes created');

    // Transaction indexes
    await Transaction.createIndexes([
      { buyer: 1 },
      { seller: 1 },
      { listing: 1 },
      { status: 1 },
      { createdAt: -1 }
    ]);
    console.log('✅ Transaction indexes created');

    // Create sample data if collections are empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📝 Creating sample data...');
      await createSampleData();
    }

    console.log('🎉 Database initialization completed!');
    console.log('');
    console.log('📊 Collections created:');
    console.log('  - users (with indexes)');
    console.log('  - listings (with indexes)');
    console.log('  - transactions (with indexes)');
    console.log('');
    console.log('🧭 You can now connect with MongoDB Compass:');
    console.log('  mongodb://localhost:27017/waste2resource');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function createSampleData() {
  const bcrypt = require('bcryptjs');

  // Create sample users
  const sampleUsers = [
    {
      name: 'Admin User',
      email: 'admin@waste2resource.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      location: 'New York, USA',
      rating: 5,
      totalTransactions: 0
    },
    {
      name: 'John Seller',
      email: 'john.seller@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'seller',
      location: 'Los Angeles, USA',
      rating: 4.5,
      totalTransactions: 15
    },
    {
      name: 'Jane Buyer',
      email: 'jane.buyer@example.com',
      password: await bcrypt.hash('password123', 12),
      role: 'buyer',
      location: 'Chicago, USA',
      rating: 4.8,
      totalTransactions: 8
    }
  ];

  const createdUsers = await User.insertMany(sampleUsers);
  console.log(`✅ Created ${createdUsers.length} sample users`);

  // Create sample listings
  const sampleListings = [
    {
      title: 'Plastic Bottles - Bulk Available',
      description: 'Large quantity of clean plastic bottles available for recycling. Perfect for manufacturing purposes.',
      seller: createdUsers[1]._id, // John Seller
      category: 'plastic',
      wasteType: 'PET Bottles',
      quantity: 500,
      unit: 'kg',
      price: 0.50,
      location: 'Los Angeles, USA',
      images: ['https://example.com/plastic1.jpg'],
      status: 'available',
      condition: 'clean',
      availability: 'immediate'
    },
    {
      title: 'Organic Food Waste',
      description: 'Fresh organic food waste suitable for composting and biogas production.',
      seller: createdUsers[1]._id,
      category: 'organic',
      wasteType: 'Food Waste',
      quantity: 200,
      unit: 'kg',
      price: 0.20,
      location: 'Los Angeles, USA',
      images: ['https://example.com/organic1.jpg'],
      status: 'available',
      condition: 'fresh',
      availability: 'daily'
    },
    {
      title: 'Electronic Waste - Computers',
      description: 'Used computer parts and electronic components for recycling.',
      seller: createdUsers[1]._id,
      category: 'ewaste',
      wasteType: 'Computer Parts',
      quantity: 50,
      unit: 'pieces',
      price: 5.00,
      location: 'Los Angeles, USA',
      images: ['https://example.com/ewaste1.jpg'],
      status: 'available',
      condition: 'used',
      availability: 'weekly'
    }
  ];

  const createdListings = await Listing.insertMany(sampleListings);
  console.log(`✅ Created ${createdListings.length} sample listings`);

  // Create sample transactions
  const sampleTransactions = [
    {
      buyer: createdUsers[2]._id, // Jane Buyer
      seller: createdUsers[1]._id, // John Seller
      listing: createdListings[0]._id,
      quantity: 100,
      totalPrice: 50.00,
      status: 'completed',
      paymentMethod: 'credit_card',
      deliveryMethod: 'pickup',
      transactionDate: new Date(),
      rating: 5,
      review: 'Great quality plastic bottles, exactly as described!'
    }
  ];

  await Transaction.insertMany(sampleTransactions);
  console.log(`✅ Created sample transactions`);
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
