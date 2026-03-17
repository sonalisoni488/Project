const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Listing = require('./models/Listing');
require('dotenv').config();

async function testBuyerOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waste2resource');
    console.log('Connected to MongoDB');

    // Find a buyer user
    const buyer = await User.findOne({ role: 'buyer' });
    
    if (!buyer) {
      console.log('❌ No buyer found in database');
      return;
    }

    console.log('🔍 Testing buyer orders for:', buyer.name, 'ID:', buyer._id);

    // Fetch orders for this buyer (simulating the API call)
    const orders = await Order.find({ buyerId: buyer._id })
      .populate('listingId', 'title imageUrl')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`\n📋 Found ${orders.length} orders for buyer ${buyer.name}:`);
    
    if (orders.length === 0) {
      console.log('No orders found. Creating test orders...');
      // Run the createTestOrders script
      require('./createTestOrders');
      return;
    }

    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ID: ${order.orderId}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Product: ${order.listingId?.title || 'N/A'}`);
      console.log(`   Seller: ${order.sellerId?.name || 'N/A'}`);
      console.log(`   Quantity: ${order.quantity}`);
      console.log(`   Unit Price: $${order.unitPrice}`);
      console.log(`   Total Price: $${order.totalPrice}`);
      console.log(`   Order Date: ${order.createdAt.toLocaleDateString()}`);
      
      if (order.shippingAddress) {
        console.log(`   Shipping: ${order.shippingAddress.city}, ${order.shippingAddress.state}`);
      }
      
      if (order.trackingNumber) {
        console.log(`   Tracking: ${order.trackingNumber}`);
      }
      
      if (order.buyerNotes) {
        console.log(`   Buyer Notes: ${order.buyerNotes}`);
      }
      
      if (order.sellerNotes) {
        console.log(`   Seller Notes: ${order.sellerNotes}`);
      }
    });

    // Test the API response format
    console.log('\n🔍 Testing API response format...');
    const apiResponse = {
      success: true,
      data: orders
    };
    
    console.log('✅ API Response format:');
    console.log(JSON.stringify(apiResponse, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBuyerOrders();
