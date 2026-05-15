const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

// Import associations
require('../src/models/associations');

async function checkOwnerCredentials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Search for properties with sekharravi email
    console.log('\n🔍 Searching for properties with "sekharravi" email...');
    
    const properties = await Listing.findAll({
      where: {
        contactEmail: {
          [Op.like]: '%sekharravi%'
        }
      },
      attributes: ['id', 'title', 'contactEmail', 'contactPerson', 'contactPhone', 'category', 'price', 'status', 'createdAt']
    });

    if (properties.length === 0) {
      console.log('❌ No properties found with "sekharravi" in contact email');
      
      // Let's search for any properties with similar emails
      console.log('\n🔍 Searching for all unique contact emails...');
      const allEmails = await Listing.findAll({
        attributes: ['contactEmail'],
        where: {
          contactEmail: { [Op.ne]: null }
        },
        group: ['contactEmail'],
        raw: true
      });
      
      console.log('📧 Found contact emails:');
      allEmails.forEach((item, index) => {
        console.log(`${index + 1}. ${item.contactEmail}`);
      });
      
      return;
    }

    console.log(`✅ Found ${properties.length} properties with "sekharravi" email:`);
    properties.forEach((property, index) => {
      console.log(`\n${index + 1}. Property: ${property.title}`);
      console.log(`   ID: ${property.id}`);
      console.log(`   Email: ${property.contactEmail}`);
      console.log(`   Contact: ${property.contactPerson}`);
      console.log(`   Phone: ${property.contactPhone}`);
      console.log(`   Category: ${property.category}`);
      console.log(`   Price: ₹${property.price}`);
      console.log(`   Status: ${property.status}`);
      console.log(`   Created: ${property.createdAt}`);
    });

    // Get unique contact emails from these properties
    const uniqueEmails = [...new Set(properties.map(p => p.contactEmail))];
    console.log(`\n📧 Unique contact emails found: ${uniqueEmails.join(', ')}`);

    // Check if user accounts exist for these emails
    console.log('\n👤 Checking user accounts for these emails...');
    
    for (const email of uniqueEmails) {
      const user = await User.findOne({
        where: { email },
        attributes: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt']
      });

      if (user) {
        console.log(`\n✅ User account exists for ${email}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Created: ${user.createdAt}`);
        
        // Check if user has a password set
        const userWithPassword = await User.findByPk(user.id, {
          attributes: ['password']
        });
        
        if (userWithPassword.password) {
          console.log(`   ✅ Password: SET (can login)`);
        } else {
          console.log(`   ❌ Password: NOT SET (cannot login)`);
        }
      } else {
        console.log(`\n❌ No user account exists for ${email}`);
        console.log(`   📝 Need to create account for this owner`);
      }
    }

    // Show owner dashboard URL
    console.log('\n🌐 Owner Dashboard URLs:');
    console.log('   Local: http://localhost:5173/owner/dashboard');
    console.log('   Login: http://localhost:5173/login');

    console.log('\n📋 Next Steps:');
    console.log('1. If user account exists but no password: Admin needs to set password');
    console.log('2. If no user account: Need to create account automatically');
    console.log('3. Owner can then login and access dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkOwnerCredentials();