const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

// Import associations
require('../src/models/associations');

async function setupSivaOwnerAccess() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    const sivaEmail = 'sekharravi406@gmail.com';
    
    // Find the siva user
    console.log(`\n👤 Checking user account for ${sivaEmail}...`);
    
    const sivaUser = await User.findOne({
      where: { email: sivaEmail },
      attributes: ['id', 'name', 'email', 'phone', 'password', 'isVerified', 'createdAt']
    });

    if (!sivaUser) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${sivaUser.name}`);
    console.log(`   ID: ${sivaUser.id}`);
    console.log(`   Email: ${sivaUser.email}`);
    console.log(`   Phone: ${sivaUser.phone}`);
    console.log(`   Verified: ${sivaUser.isVerified}`);
    console.log(`   Created: ${sivaUser.createdAt}`);

    // Check if user has password
    const hasPassword = !!sivaUser.password;
    console.log(`   Password Set: ${hasPassword ? 'YES' : 'NO'}`);

    // Get user's listings
    const userListings = await Listing.findAll({
      where: { userId: sivaUser.id },
      attributes: ['id', 'title', 'category', 'price', 'status', 'contactEmail', 'views', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n🏠 Found ${userListings.length} listings by ${sivaUser.name}:`);
    userListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Category: ${listing.category}`);
      console.log(`   Price: ₹${listing.price}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Views: ${listing.views}`);
      console.log(`   Contact Email: ${listing.contactEmail || 'Not set'}`);
      console.log(`   Created: ${listing.createdAt}`);
    });

    // Set up owner access if password not set
    if (!hasPassword) {
      console.log('\n🔐 Setting up owner dashboard access...');
      
      const ownerPassword = 'siva123'; // Default password
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      
      await sivaUser.update({
        password: hashedPassword,
        isVerified: true
      });
      
      console.log('✅ Password set successfully');
      console.log(`   Password: ${ownerPassword}`);
    } else {
      console.log('\n✅ User already has password set');
    }

    // Update listings to have proper contact email for owner matching
    console.log('\n📧 Updating listings contact email for owner matching...');
    
    const updatedCount = await Listing.update(
      { 
        contactEmail: sivaUser.email,
        contactPerson: sivaUser.name
      },
      { 
        where: { 
          userId: sivaUser.id,
          contactEmail: { [require('sequelize').Op.or]: [null, ''] }
        }
      }
    );
    
    console.log(`✅ Updated ${updatedCount[0]} listings with contact email`);

    // Calculate earnings summary
    const totalListings = userListings.length;
    const activeListings = userListings.filter(l => l.status === 'active').length;
    const soldListings = userListings.filter(l => l.status === 'sold').length;
    const rentedListings = userListings.filter(l => l.status === 'rented').length;
    const totalViews = userListings.reduce((sum, l) => sum + (l.views || 0), 0);

    console.log('\n📊 Owner Dashboard Summary:');
    console.log(`   Total Properties: ${totalListings}`);
    console.log(`   Active: ${activeListings}`);
    console.log(`   Sold: ${soldListings}`);
    console.log(`   Rented: ${rentedListings}`);
    console.log(`   Total Views: ${totalViews}`);

    console.log('\n🎉 Owner Dashboard Setup Complete!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Name: ${sivaUser.name}`);
    console.log(`   Email: ${sivaUser.email}`);
    console.log(`   Password: ${hasPassword ? 'Already set (use existing)' : 'siva123'}`);

    console.log('\n🌐 Access URLs:');
    console.log('   Login: http://localhost:5173/login');
    console.log('   Owner Dashboard: http://localhost:5173/owner/dashboard');

    console.log('\n📝 Instructions:');
    console.log('1. Go to http://localhost:5173/login');
    console.log(`2. Enter email: ${sivaUser.email}`);
    console.log(`3. Enter password: ${hasPassword ? '(use existing password)' : 'siva123'}`);
    console.log('4. After login, navigate to Owner Dashboard');
    console.log('5. View all properties, earnings, and analytics');

    // Also check for ramesh@gmail.com contact email
    console.log('\n📧 Checking ramesh@gmail.com contact email...');
    const rameshUser = await User.findOne({
      where: { email: 'ramesh@gmail.com' }
    });

    if (!rameshUser) {
      console.log('\n👤 Creating owner account for ramesh@gmail.com...');
      
      const rameshPassword = 'ramesh123';
      const hashedRameshPassword = await bcrypt.hash(rameshPassword, 10);
      
      const newRameshUser = await User.create({
        name: 'Ramesh',
        email: 'ramesh@gmail.com',
        phone: '9089089087',
        password: hashedRameshPassword,
        isVerified: true,
        role: 'user'
      });
      
      console.log(`✅ Created owner account for Ramesh (ID: ${newRameshUser.id})`);
      console.log(`   Email: ramesh@gmail.com`);
      console.log(`   Password: ramesh123`);
    } else {
      console.log('✅ Owner account already exists for ramesh@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupSivaOwnerAccess();