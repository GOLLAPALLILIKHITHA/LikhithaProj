const axios = require('axios');
const sequelize = require('../src/config/database');

async function testRentalWithKYC() {
  try {
    console.log('🧪 Testing rental creation with KYC verification...');
    
    // Register a test user
    let authToken;
    let userId;
    
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'KYC Test User',
        email: 'kyctest@example.com',
        password: 'password123',
        phone: '9876543210'
      });
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user.id;
      console.log('✅ Registered test user with ID:', userId);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        // User already exists, try to login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'kyctest@example.com',
          password: 'password123'
        });
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        console.log('✅ Logged in with existing user ID:', userId);
      } else {
        throw error;
      }
    }
    
    // Create a verified KYC record directly in database
    try {
      await sequelize.query(`
        INSERT INTO kyc (userId, fullName, dateOfBirth, address, documentType, documentNumber, documentUrl, status, createdAt, updatedAt)
        VALUES (?, 'KYC Test User', '1990-01-01', 'Test Address', 'aadhar', '123456789012', 'test-document.pdf', 'verified', NOW(), NOW())
        ON DUPLICATE KEY UPDATE status = 'verified'
      `, {
        replacements: [userId]
      });
      console.log('✅ Created verified KYC record');
    } catch (kycError) {
      console.log('⚠️ KYC creation warning:', kycError.message);
    }
    
    // Now test rental creation
    try {
      const rentalResponse = await axios.post('http://localhost:5000/api/property-rentals/create-order', {
        listingId: 2, // Siva House
        startDate: '2026-05-05'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('🎉 Rental creation successful!');
      console.log('📋 Order Details:');
      console.log(`- Order ID: ${rentalResponse.data.orderId}`);
      console.log(`- Amount: ₹${rentalResponse.data.amount.toLocaleString()}`);
      console.log(`- Rental ID: ${rentalResponse.data.rentalId}`);
      console.log('💰 Payment Breakdown:');
      console.log(`- Monthly Rent: ₹${rentalResponse.data.breakdown.monthlyRent.toLocaleString()}`);
      console.log(`- Advance Payment: ${rentalResponse.data.breakdown.advancePayment}`);
      console.log(`- First Month Rent: ${rentalResponse.data.breakdown.firstMonthRent}`);
      console.log(`- Total Upfront: ${rentalResponse.data.breakdown.initialPayment}`);
      console.log(`- Paid Until: ${rentalResponse.data.breakdown.paidUntilDate}`);
      console.log(`- Payment Day: ${rentalResponse.data.breakdown.paymentDayOfMonth}`);
      console.log(`- Rental Type: ${rentalResponse.data.breakdown.rentalType}`);
      
    } catch (rentalError) {
      console.log('❌ Rental creation failed:');
      console.log('Status:', rentalError.response?.status);
      console.log('Error:', rentalError.response?.data || rentalError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRentalWithKYC();