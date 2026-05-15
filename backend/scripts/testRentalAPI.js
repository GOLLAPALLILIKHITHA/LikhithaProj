const sequelize = require('../src/config/database');
const { getAllRentalAgreements } = require('../src/controllers/rentalController');

// Mock request and response objects
const mockReq = {
  query: {}
};

const mockRes = {
  json: (data) => {
    console.log('✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
  },
  status: (code) => ({
    json: (data) => {
      console.log(`❌ Error Response (${code}):`, data);
    }
  })
};

async function testRentalAPI() {
  try {
    console.log('🧪 Testing Rental API...\n');
    await getAllRentalAgreements(mockReq, mockRes);
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRentalAPI();