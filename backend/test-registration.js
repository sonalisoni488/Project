// Test registration endpoint
const axios = require('axios');

async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const testData = {
      name: 'Test User ' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      role: 'buyer'
    };
    
    console.log('📤 Sending data:', testData);
    
    const response = await axios.post('http://localhost:5002/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3002'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('📊 Response data:', response.data);
    
    if (response.data.user) {
      console.log('🎉 User created in database!');
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    if (error.response) {
      console.error('📊 Error status:', error.response.status);
      console.error('📊 Error data:', error.response.data);
    }
  }
}

testRegistration();
