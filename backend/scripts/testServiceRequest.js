const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const ServiceRequest = require('../src/models/ServiceRequest');

async function testServiceRequestAPI() {
  try {
    console.log('🔍 TESTING SERVICE REQUEST SUBMISSION');
    console.log('═══════════════════════════════════════\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if we have any users
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    // Get a test user
    const testUser = await User.findOne();
    console.log(`👤 Test user: ${testUser.name} (${testUser.email})`);

    // Test direct database insertion
    console.log('\n🧪 Testing direct database insertion...');
    
    const testServiceRequest = await ServiceRequest.create({
      userId: testUser.id,
      serviceType: 'Plumbing',
      problemDescription: 'Test service request - leaky faucet in kitchen',
      userPhone: '9876543210',
      userAddress: '123 Test Street, Test City',
      status: 'pending'
    });

    console.log('✅ Direct database insertion successful');
    console.log(`📝 Service Request ID: ${testServiceRequest.id}`);

    // Test API endpoint (if server is running)
    console.log('\n🌐 Testing API endpoint...');
    
    try {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const apiResponse = await axios.post('http://localhost:5000/api/service-requests/create', {
        serviceType: 'Electrical',
        problemDescription: 'Test API request - electrical outlet not working',
        userPhone: '9876543210',
        userAddress: '456 API Test Street, Test City'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API endpoint test successful');
      console.log(`📝 API Response: ${apiResponse.data.message}`);
      
    } catch (apiError) {
      console.log('❌ API endpoint test failed');
      console.log(`Error: ${apiError.message}`);
      
      if (apiError.response) {
        console.log(`Status: ${apiError.response.status}`);
        console.log(`Response: ${JSON.stringify(apiError.response.data, null, 2)}`);
      }
      
      if (apiError.code === 'ECONNREFUSED') {
        console.log('💡 Backend server is not running. Start it with: npm run dev');
      }
    }

    // Check service requests in database
    console.log('\n📋 Current service requests in database:');
    const allRequests = await ServiceRequest.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    allRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.serviceType} - ${req.status} (${req.user.name})`);
    });

    console.log('\n🔧 TROUBLESHOOTING GUIDE:');
    console.log('═══════════════════════════════════════');
    console.log('1. Make sure backend server is running: npm run dev');
    console.log('2. Make sure frontend server is running: npm run dev');
    console.log('3. Check if user is logged in on frontend');
    console.log('4. Check browser console for errors');
    console.log('5. Check network tab in browser dev tools');
    console.log('\n📍 Backend URL: http://localhost:5000');
    console.log('📍 Frontend URL: http://localhost:5173');
    console.log('📍 API Endpoint: http://localhost:5000/api/service-requests/create');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testServiceRequestAPI();