const axios = require('axios');

async function testRentalWithAuth() {
  try {
    console.log('🧪 Testing rental creation with authentication...');
    
    // First, let's try to login or register a test user
    let authToken;
    
    try {
      // Try to login with existing user
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      authToken = loginResponse.data.token;
      console.log('✅ Logged in with existing user');
    } catch (loginError) {
      // If login fails, try to register
      try {
        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890'
        });
        authToken = registerResponse.data.token;
        console.log('✅ Registered new test user');
      } catch (registerError) {
        console.log('❌ Could not authenticate:', registerError.response?.data || registerError.message);
        return;
      }
    }
    
    // Now test rental creation with auth
    try {
      const rentalResponse = await axios.post('http://localhost:5000/api/property-rentals/create-order', {
        listingId: 2, // Siva House
        startDate: '2026-05-05'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('✅ Rental creation successful!');
      console.log('Order details:', {
        orderId: rentalResponse.data.orderId,
        amount: rentalResponse.data.amount,
        breakdown: rentalResponse.data.breakdown
      });
    } catch (rentalError) {
      console.log('❌ Rental creation failed:');
      console.log('Status:', rentalError.response?.status);
      console.log('Error:', rentalError.response?.data || rentalError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRentalWithAuth();