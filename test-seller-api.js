// Test script for seller API
const axios = require('axios');

async function testSellerAPI() {
  try {
    console.log('🧪 Testing Seller API...');
    
    // Test health check
    const healthResponse = await axios.get('http://localhost:5002/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login to get token (you'll need to replace with actual credentials)
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'seller@test.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      
      // Test dashboard data
      const dashboardResponse = await axios.get('http://localhost:5002/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Dashboard data:', dashboardResponse.data);
      
      // Test create listing (with mock image data)
      const FormData = require('form-data');
      const fs = require('fs');
      
      const formData = new FormData();
      formData.append('category', 'plastic');
      formData.append('quantity', '50');
      formData.append('expectedPrice', '25');
      formData.append('description', 'Test plastic bottles');
      formData.append('location', 'New York, NY');
      
      try {
        const createResponse = await axios.post('http://localhost:5002/api/seller/listings', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('✅ Listing created:', createResponse.data);
      } catch (createError) {
        console.log('❌ Create listing error:', createError.response?.data || createError.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSellerAPI();
