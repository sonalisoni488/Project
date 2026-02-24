const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const Transaction = require('../models/Transaction');
require('dotenv').config();

// Sample data
const sampleUsers = [
  {
    name: 'John Seller',
    email: 'john.seller@example.com',
    password: 'Password123',
    role: 'seller',
    location: 'New York, NY',
    phone: '+1-555-0101'
  },
  {
    name: 'Jane Buyer',
    email: 'jane.buyer@example.com',
    password: 'Password123',
    role: 'buyer',
    location: 'Los Angeles, CA',
    phone: '+1-555-0102'
  },
  {
    name: 'Admin User',
    email: 'admin@waste2resource.com',
    password: 'Admin123!',
    role: 'admin',
    location: 'Chicago, IL',
    phone: '+1-555-0103'
  },
  {
    name: 'Mike Recycler',
    email: 'mike.recycler@example.com',
    password: 'Password123',
    role: 'seller',
    location: 'Houston, TX',
    phone: '+1-555-0104'
  },
  {
    name: 'Sarah Green',
    email: 'sarah.green@example.com',
    password: 'Password123',
    role: 'buyer',
    location: 'Phoenix, AZ',
    phone: '+1-555-0105'
  }
];

const sampleListings = [
  {
    wasteType: 'Plastic',
    weight: 15.5,
    description: 'Clean plastic bottles and containers, washed and sorted by color. Perfect for recycling.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    aiConfidence: 92.5,
    suggestedPrice: 7.75,
    finalPrice: 8.50,
    location: 'New York, NY',
    condition: 'excellent',
    pickupAvailable: true,
    deliveryAvailable: false,
    tags: ['recyclable', 'clean', 'bottles', 'containers']
  },
  {
    wasteType: 'Metal',
    weight: 25.0,
    description: 'Mixed aluminum cans and steel scraps. All materials are clean and separated.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    aiConfidence: 88.3,
    suggestedPrice: 50.00,
    finalPrice: 52.00,
    location: 'Houston, TX',
    condition: 'good',
    pickupAvailable: true,
    deliveryAvailable: true,
    tags: ['aluminum', 'steel', 'cans', 'scraps']
  },
  {
    wasteType: 'Paper',
    weight: 40.0,
    description: 'Office paper waste, mostly white and clean. Includes newspapers and cardboard.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    aiConfidence: 95.1,
    suggestedPrice: 12.00,
    finalPrice: 15.00,
    location: 'Los Angeles, CA',
    condition: 'good',
    pickupAvailable: true,
    deliveryAvailable: false,
    tags: ['office', 'newspaper', 'cardboard', 'clean']
  },
  {
    wasteType: 'E-waste',
    weight: 8.5,
    description: 'Old computer components and electronics. All items are tested and working.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    aiConfidence: 89.7,
    suggestedPrice: 42.50,
    finalPrice: 45.00,
    location: 'Chicago, IL',
    condition: 'fair',
    pickupAvailable: true,
    deliveryAvailable: true,
    tags: ['electronics', 'computer', 'components', 'working']
  },
  {
    wasteType: 'Textile',
    weight: 12.0,
    description: 'Used clothing and fabric scraps. All materials are clean and sorted by type.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    aiConfidence: 91.2,
    suggestedPrice: 9.60,
    finalPrice: 10.00,
    location: 'Phoenix, AZ',
    condition: 'good',
    pickupAvailable: true,
    deliveryAvailable: false,
    tags: ['clothing', 'fabric', 'textiles', 'clean']
  }
];

const sampleTransactions = [
  {
    paymentMethod: 'bank_transfer',
    pickupAddress: '123 Main St, New York, NY 10001',
    deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
    notes: 'Please call before pickup.',
    carbonSaved: 38.75,
    landfillReduction: 15.5
  },
  {
    paymentMethod: 'cash',
    pickupAddress: '789 Pine Rd, Houston, TX 77001',
    notes: 'Available for pickup on weekends.',
    carbonSaved: 75.00,
    landfillReduction: 25.0
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
    await WasteListing.deleteMany({});
    await Transaction.deleteMany({});
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
      
      const listing = new WasteListing({
        ...listingData,
        sellerId: seller._id,
        status: i < 3 ? 'available' : 'sold'
      });
      
      const savedListing = await listing.save();
      createdListings.push(savedListing);
      console.log(`Created listing: ${savedListing.wasteType} - ${savedListing.description.substring(0, 30)}...`);
    }

    // Create transactions
    console.log('Creating transactions...');
    const buyerUsers = createdUsers.filter(user => user.role === 'buyer');
    const availableListings = createdListings.filter(listing => listing.status === 'sold');
    
    for (let i = 0; i < Math.min(sampleTransactions.length, availableListings.length); i++) {
      const transactionData = sampleTransactions[i];
      const listing = availableListings[i];
      const buyer = buyerUsers[i % buyerUsers.length];
      
      const transaction = new Transaction({
        ...transactionData,
        buyerId: buyer._id,
        sellerId: listing.sellerId,
        listingId: listing._id,
        price: listing.finalPrice,
        status: 'completed',
        paymentStatus: 'paid',
        pickupDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        buyerRating: Math.floor(Math.random() * 2) + 4,
        sellerRating: Math.floor(Math.random() * 2) + 4
      });
      
      const savedTransaction = await transaction.save();
      console.log(`Created transaction: $${savedTransaction.price} - ${savedTransaction.status}`);
    }

    // Update user stats
    console.log('Updating user statistics...');
    for (const user of createdUsers) {
      const transactions = await Transaction.find({
        $or: [
          { buyerId: user._id },
          { sellerId: user._id }
        ],
        status: 'completed'
      });

      if (transactions.length > 0) {
        const ratings = transactions
          .filter(t => t.buyerRating && user.role === 'seller')
          .map(t => t.buyerRating)
          .concat(
            transactions
              .filter(t => t.sellerRating && user.role === 'buyer')
              .map(t => t.sellerRating)
          );

        if (ratings.length > 0) {
          user.rating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        }
      }

      user.totalTransactions = transactions.length;
      await user.save();
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Listings: ${createdListings.length}`);
    console.log(`- Transactions: ${Math.min(sampleTransactions.length, availableListings.length)}`);
    
    console.log('\n👤 Login Credentials:');
    console.log('- Admin: admin@waste2resource.com / Admin123!');
    console.log('- Seller: john.seller@example.com / Password123');
    console.log('- Buyer: jane.buyer@example.com / Password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
