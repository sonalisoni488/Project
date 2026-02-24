const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Listing = require('../models/Listing');
const SimpleTransaction = require('../models/SimpleTransaction');
require('dotenv').config();

// Sample data
const sampleUsers = [
  {
    name: 'John Seller',
    email: 'john.seller@example.com',
    password: 'password123',
    role: 'seller',
    location: 'New York, NY',
    phone: '+1-555-0101'
  },
  {
    name: 'Jane Buyer',
    email: 'jane.buyer@example.com',
    password: 'password123',
    role: 'buyer',
    location: 'Los Angeles, CA',
    phone: '+1-555-0102'
  },
  {
    name: 'Admin User',
    email: 'admin@waste2resource.com',
    password: 'admin123',
    role: 'admin',
    location: 'Chicago, IL',
    phone: '+1-555-0103'
  },
  {
    name: 'Mike Recycler',
    email: 'mike.recycler@example.com',
    password: 'password123',
    role: 'seller',
    location: 'Houston, TX',
    phone: '+1-555-0104'
  },
  {
    name: 'Sarah Green',
    email: 'sarah.green@example.com',
    password: 'password123',
    role: 'buyer',
    location: 'Phoenix, AZ',
    phone: '+1-555-0105'
  }
];

const sampleListings = [
  {
    title: 'Clean Plastic Bottles',
    wasteType: 'Plastic',
    weight: 15.5,
    description: 'Clean plastic bottles and containers, washed and sorted by color. Perfect for recycling.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    price: 8.50,
    location: 'New York, NY'
  },
  {
    title: 'Mixed Aluminum Cans',
    wasteType: 'Metal',
    weight: 25.0,
    description: 'Mixed aluminum cans and steel scraps. All materials are clean and separated.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    price: 52.00,
    location: 'Houston, TX'
  },
  {
    title: 'Office Paper Waste',
    wasteType: 'Paper',
    weight: 40.0,
    description: 'Office paper waste, mostly white and clean. Includes newspapers and cardboard.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    price: 15.00,
    location: 'Los Angeles, CA'
  },
  {
    title: 'Old Computer Components',
    wasteType: 'E-waste',
    weight: 8.5,
    description: 'Old computer components and electronics. All items are tested and working.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    price: 45.00,
    location: 'Chicago, IL'
  },
  {
    title: 'Used Clothing and Fabric',
    wasteType: 'Textile',
    weight: 12.0,
    description: 'Used clothing and fabric scraps. All materials are clean and sorted by type.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    price: 10.00,
    location: 'Phoenix, AZ'
  }
];

const sampleTransactions = [
  {
    agreedPrice: 8.50
  },
  {
    agreedPrice: 52.00
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await SimpleTransaction.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name} (${savedUser.email})`);
    }

    // Create listings
    console.log('Creating listings...');
    const sellerUsers = createdUsers.filter(user => user.role === 'seller');
    const createdListings = [];
    
    for (let i = 0; i < sampleListings.length; i++) {
      const listingData = sampleListings[i];
      const seller = sellerUsers[i % sellerUsers.length];
      
      const listing = new Listing({
        ...listingData,
        seller: seller._id
      });
      
      const savedListing = await listing.save();
      createdListings.push(savedListing);
      console.log(`Created listing: ${savedListing.title} - ${savedListing.wasteType}`);
    }

    // Create transactions
    console.log('Creating transactions...');
    const buyerUsers = createdUsers.filter(user => user.role === 'buyer');
    const availableListings = createdListings.filter(listing => listing.status === 'available');
    
    for (let i = 0; i < Math.min(sampleTransactions.length, availableListings.length); i++) {
      const transactionData = sampleTransactions[i];
      const listing = availableListings[i];
      const buyer = buyerUsers[i % buyerUsers.length];
      
      const transaction = new SimpleTransaction({
        ...transactionData,
        buyer: buyer._id,
        seller: listing.seller,
        listing: listing._id,
        status: 'completed'
      });
      
      const savedTransaction = await transaction.save();
      console.log(`Created transaction: $${savedTransaction.agreedPrice} - ${savedTransaction.status}`);
      
      // Update listing status to sold
      await Listing.findByIdAndUpdate(listing._id, { status: 'sold' });
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Listings: ${createdListings.length}`);
    console.log(`- Transactions: ${Math.min(sampleTransactions.length, availableListings.length)}`);
    
    console.log('\n👤 Login Credentials:');
    console.log('- Admin: admin@waste2resource.com / admin123');
    console.log('- Seller: john.seller@example.com / password123');
    console.log('- Buyer: jane.buyer@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
