// Test admin endpoint directly without authentication
const sequelize = require('../src/config/database');
const leisureLeaseController = require('../src/controllers/leisureLeaseController');

// Import associations to ensure they are loaded
require('../src/models/associations');

async function testAdminEndpointDirectly() {
  try {
    console.log('🧪 Testing admin endpoint directly...');

    // Mock request and response objects
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log('✅ Admin endpoint response:');
        console.log(JSON.stringify(data, null, 2));
        return mockRes;
      },
      status: (code) => {
        console.log(`Response status: ${code}`);
        return mockRes;
      }
    };

    // Call the controller function directly
    await leisureLeaseController.getAllLeisureLeases(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Error testing admin endpoint:', error);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testAdminEndpointDirectly();