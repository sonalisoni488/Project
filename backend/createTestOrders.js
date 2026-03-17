const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Listing = require('./models/Listing');
require('dotenv').config();

async function createTestOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Get a buyer and seller
    const buyer = await User.findOne({ role: 'buyer' });
    const seller = await User.findOne({ role: 'seller' });
    
    if (!buyer || !seller) {
      console.log('❌ No buyer or seller found');
      return;
    }

    // Get a listing for this seller
    const listing = await Listing.findOne({ seller: seller._id });
    
    if (!listing) {
      console.log('❌ No listing found for seller');
      return;
    }

    console.log('🔍 Creating test orders...');
    console.log('Buyer:', buyer.name, 'ID:', buyer._id);
    console.log('Seller:', seller.name, 'ID:', seller._id);
    console.log('Listing:', listing.title, 'ID:', listing._id);

    // Create test orders with different statuses
    const testOrders = [
      {
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        sellerId: seller._id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        listingId: listing._id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        quantity: 2,
        unitPrice: 75,
        totalPrice: 150,
        status: 'pending',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        buyerNotes: 'Please deliver during business hours'
      },
      {
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        sellerId: seller._id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        listingId: listing._id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100,
        status: 'confirmed',
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        sellerNotes: 'Order confirmed. Will ship within 2 business days.'
      },
      {
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        sellerId: seller._id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        listingId: listing._id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        quantity: 3,
        unitPrice: 50,
        totalPrice: 150,
        status: 'shipped',
        trackingNumber: 'TRACK123456789',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        shippingAddress: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        sellerNotes: 'Order has been shipped with tracking number TRACK123456789'
      }
    ];

    // Clear existing orders for this buyer
    await Order.deleteMany({ buyerId: buyer._id });

    // Create new test orders
    for (const orderData of testOrders) {
      const order = new Order(orderData);
      await order.save();
      console.log(`✅ Created test order: ${order.orderId} - Status: ${order.status}`);
    }

    // Verify orders were created
    const createdOrders = await Order.find({ buyerId: buyer._id })
      .populate('listingId', 'title')
      .populate('sellerId', 'name email');
    
    console.log(`\n📋 Total orders created: ${createdOrders.length}`);
    createdOrders.forEach(order => {
      console.log(`- ${order.orderId}: ${order.status} - $${order.totalPrice} for ${order.listingId?.title}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestOrders();
