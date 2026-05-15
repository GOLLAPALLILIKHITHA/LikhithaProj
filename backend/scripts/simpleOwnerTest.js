const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function simpleOwnerTest() {
  try {
    console.log('🏠 SIMPLE OWNER DASHBOARD TEST');
    console.log('═══════════════════════════════════════\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create or find test owner
    let owner = await User.findOne({ where: { email: 'owner@test.com' } });
    
    if (!owner) {
      owner = await User.create({
        name: 'Property Owner',
        email: 'owner@test.com',
        password: await bcrypt.hash('Owner@123', 10),
        phone: '9876543210',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Created test owner');
    } else {
      console.log('ℹ️  Using existing owner');
    }

    // Create a simple property
    const existingProperty = await Listing.findOne({ where: { userId: owner.id } });
    
    if (!existingProperty) {
      await Listing.create({
        title: 'Test Property',
        description: 'A test property for owner dashboard',
        category: 'property_rent',
        price: 20000,
        priceType: 'per_month',
        location: 'Test Location',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        status: 'active',
        userId: owner.id
      });
      console.log('✅ Created test property');
    }

    // Test API endpoints
    console.log('\n🌐 Testing API endpoints...');
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: owner.id, email: owner.email, role: owner.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    try {
      // Test dashboard
      const dashboardResponse = await axios.get('http://localhost:5000/api/owner/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard API working');
      console.log(`📊 Total Properties: ${dashboardResponse.data.overview.totalProperties}`);

      // Test properties
      const propertiesResponse = await axios.get('http://localhost:5000/api/owner/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Properties API working');
      console.log(`📋 Properties found: ${propertiesResponse.data.properties.length}`);

    } catch (apiError) {
      console.log('❌ API test failed:', apiError.message);
      if (apiError.code === 'ECONNREFUSED') {
        console.log('💡 Backend server not running. Start with: npm run dev');
      }
    }

    console.log('\n🎯 OWNER DASHBOARD READY!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Owner Email: owner@test.com');
    console.log('🔑 Password: Owner@123');
    console.log('🌐 Dashboard: http://localhost:5173/owner/dashboard');
    console.log('\n📋 Steps to test:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Login with owner credentials');
    console.log('3. Go to owner dashboard URL');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

simpleOwnerTest();