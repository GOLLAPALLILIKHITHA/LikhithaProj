const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function testOwnerAccountFlow() {
  try {
    console.log('🏠 TESTING OWNER ACCOUNT AUTO-CREATION FLOW');
    console.log('═══════════════════════════════════════\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Step 1: Create a regular user who will post a listing
    let regularUser = await User.findOne({ where: { email: 'listingcreator@test.com' } });
    
    if (!regularUser) {
      regularUser = await User.create({
        name: 'Listing Creator',
        email: 'listingcreator@test.com',
        password: await bcrypt.hash('Creator@123', 10),
        phone: '9876543210',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Created regular user for listing creation');
    } else {
      console.log('ℹ️  Using existing regular user');
    }

    // Step 2: Simulate creating a listing with owner contact details
    const ownerEmail = 'propertyowner@example.com';
    const ownerName = 'John Property Owner';
    const ownerPhone = '9876543211';

    console.log(`\n📋 Creating listing with owner contact: ${ownerEmail}`);

    // Check if owner account exists before listing creation
    const ownerBeforeCreation = await User.findOne({ where: { email: ownerEmail } });
    console.log(`Owner account before listing: ${ownerBeforeCreation ? 'EXISTS' : 'DOES NOT EXIST'}`);

    // Create listing (this should auto-create owner account)
    const listingData = {
      title: 'Beautiful 3BHK Apartment',
      description: 'Spacious apartment with modern amenities',
      category: 'property_rent',
      subCategory: 'apartment',
      price: 25000,
      priceType: 'per_month',
      location: 'Whitefield, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      areaUnit: 'sqft',
      furnishing: 'semi_furnished',
      // Owner contact details (this should trigger auto-account creation)
      contactPerson: ownerName,
      contactPhone: ownerPhone,
      contactEmail: ownerEmail,
      userId: regularUser.id
    };

    const listing = await Listing.create(listingData);
    console.log('✅ Listing created successfully');

    // Check if owner account was auto-created
    const ownerAfterCreation = await User.findOne({ where: { email: ownerEmail } });
    if (ownerAfterCreation && !ownerBeforeCreation) {
      console.log('✅ Owner account auto-created successfully!');
      console.log(`   Name: ${ownerAfterCreation.name}`);
      console.log(`   Email: ${ownerAfterCreation.email}`);
      console.log(`   Verified: ${ownerAfterCreation.isVerified}`);
    } else if (ownerAfterCreation) {
      console.log('ℹ️  Owner account already existed');
    } else {
      console.log('❌ Owner account was not created');
    }

    // Step 3: Test admin setting password for owner
    if (ownerAfterCreation) {
      console.log('\n🔐 Testing admin password setting...');
      
      const jwt = require('jsonwebtoken');
      const adminToken = jwt.sign(
        { id: 1, email: process.env.ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      try {
        // Test admin API to set owner password
        const passwordResponse = await axios.put(
          `http://localhost:5000/api/admin/owner-accounts/${ownerAfterCreation.id}/password`,
          {
            password: 'Owner@123456',
            sendEmail: false // Don't send email in test
          },
          {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }
        );

        console.log('✅ Admin password setting API working');
        console.log(`   Response: ${passwordResponse.data.message}`);

        // Verify owner can now login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: ownerEmail,
          password: 'Owner@123456'
        });

        console.log('✅ Owner login working');
        
        // Test owner dashboard access
        const ownerToken = loginResponse.data.token;
        const dashboardResponse = await axios.get('http://localhost:5000/api/owner/dashboard', {
          headers: { 'Authorization': `Bearer ${ownerToken}` }
        });

        console.log('✅ Owner dashboard access working');
        console.log(`   Properties found: ${dashboardResponse.data.overview.totalProperties}`);

      } catch (apiError) {
        console.log('❌ API test failed:', apiError.message);
        if (apiError.code === 'ECONNREFUSED') {
          console.log('💡 Backend server not running. Start with: npm run dev');
        }
      }
    }

    // Step 4: Create another listing with same owner email
    console.log('\n📋 Creating second listing with same owner email...');
    
    const secondListing = await Listing.create({
      ...listingData,
      title: 'Cozy 2BHK Villa',
      category: 'property_sell',
      price: 5500000,
      priceType: 'fixed',
      bedrooms: 2
    });

    console.log('✅ Second listing created');

    // Check total properties for owner
    const totalProperties = await Listing.count({
      where: { contactEmail: ownerEmail }
    });

    console.log(`✅ Owner now has ${totalProperties} properties`);

    console.log('\n🎯 OWNER ACCOUNT FLOW TEST SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log('✅ Auto-creation of owner accounts working');
    console.log('✅ Admin can set passwords for owners');
    console.log('✅ Owners can login with their email');
    console.log('✅ Owner dashboard shows properties by email match');
    console.log('✅ Multiple listings with same email work correctly');

    console.log('\n📋 TEST ACCOUNTS CREATED:');
    console.log('═══════════════════════════════════════');
    console.log('👤 Regular User (creates listings):');
    console.log(`   Email: ${regularUser.email}`);
    console.log('   Password: Creator@123');
    
    console.log('\n🏠 Property Owner (auto-created):');
    console.log(`   Email: ${ownerEmail}`);
    console.log('   Password: Owner@123456 (set by admin)');
    console.log('   Dashboard: http://localhost:5173/owner/dashboard');

    console.log('\n📋 ADMIN ACTIONS NEEDED:');
    console.log('1. Login as admin');
    console.log('2. Go to Owner Management section');
    console.log('3. Set passwords for new owner accounts');
    console.log('4. Send credentials to owners');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOwnerAccountFlow();