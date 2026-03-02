// Simple API test
const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing API connection...');
    
    const response = await axios.post('http://localhost:5002/api/auth/register', {
      name: 'New Test User',
      email: 'newuser' + Date.now() + '@example.com',
      password: 'password123',
      role: 'buyer'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Status:', response.status);
    console.log('📊 Data:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔥 Connection refused - Is backend running?');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔥 Host not found - Check URL');
    } else if (error.response) {
      console.error('📊 Server responded:', error.response.status, error.response.data);
    }
  }
}

testAPI();
