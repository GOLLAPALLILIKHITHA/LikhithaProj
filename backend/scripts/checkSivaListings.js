const { Op } = require('sequelize');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

// Import associations
require('../src/models/associations');

async function checkSivaListings() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Search for listings with "siva" in title, contact person, or contact email
    console.log('\n🔍 Searching for listings with "siva"...');
    
    const sivaListings = await Listing.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: '%siva%' } },
          { contactPerson: { [Op.like]: '%siva%' } },
          { contactEmail: { [Op.like]: '%siva%' } },
          { description: { [Op.like]: '%siva%' } }
        ]
      },
      include: [{ 
        model: User, 
        as: 'seller', 
        attributes: ['id', 'name', 'email', 'phone'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    if (sivaListings.length === 0) {
      console.log('❌ No listings found with "siva"');
      
      // Let's search for users with "siva" in their name or email
      console.log('\n🔍 Searching for users with "siva"...');
      const sivaUsers = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%siva%' } },
            { email: { [Op.like]: '%siva%' } }
          ]
        },
        attributes: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt']
      });

      if (sivaUsers.length > 0) {
        console.log(`✅ Found ${sivaUsers.length} users with "siva":`);
        sivaUsers.forEach((user, index) => {
          console.log(`\n${index + 1}. User: ${user.name}`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Phone: ${user.phone}`);
          console.log(`   Verified: ${user.isVerified}`);
          console.log(`   Created: ${user.createdAt}`);
        });

        // Check if these users have any listings
        for (const user of sivaUsers) {
          const userListings = await Listing.findAll({
            where: { userId: user.id },
            attributes: ['id', 'title', 'category', 'price', 'status', 'contactEmail']
          });

          if (userListings.length > 0) {
            console.log(`\n📋 Listings by ${user.name}:`);
            userListings.forEach((listing, index) => {
              console.log(`   ${index + 1}. ${listing.title} - ${listing.category} - ₹${listing.price}`);
            });
          } else {
            console.log(`\n📋 No listings found for ${user.name}`);
          }
        }
      } else {
        console.log('❌ No users found with "siva" either');
      }
      
      return;
    }

    console.log(`✅ Found ${sivaListings.length} listings with "siva":`);
    
    sivaListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. Listing: ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Category: ${listing.category}`);
      console.log(`   Price: ₹${listing.price}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Location: ${listing.location}, ${listing.city}`);
      console.log(`   Contact Person: ${listing.contactPerson}`);
      console.log(`   Contact Email: ${listing.contactEmail}`);
      console.log(`   Contact Phone: ${listing.contactPhone}`);
      console.log(`   Seller: ${listing.seller ? `${listing.seller.name} (${listing.seller.email})` : 'No user account'}`);
      console.log(`   Created: ${listing.createdAt}`);
      console.log(`   Views: ${listing.views}`);
      console.log(`   Verified: ${listing.isVerified}`);
      console.log(`   Featured: ${listing.isFeatured}`);
    });

    // Get unique contact emails from siva listings
    const uniqueEmails = [...new Set(sivaListings.map(l => l.contactEmail).filter(Boolean))];
    
    if (uniqueEmails.length > 0) {
      console.log(`\n📧 Contact emails found: ${uniqueEmails.join(', ')}`);
      
      // Check if owner accounts exist for these emails
      console.log('\n👤 Checking owner accounts...');
      
      for (const email of uniqueEmails) {
        const user = await User.findOne({
          where: { email },
          attributes: ['id', 'name', 'email', 'phone', 'isVerified', 'createdAt']
        });

        if (user) {
          console.log(`\n✅ Owner account exists for ${email}:`);
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
            console.log(`   ✅ Password: SET (can login to owner dashboard)`);
          } else {
            console.log(`   ❌ Password: NOT SET (cannot login - admin needs to set password)`);
          }
        } else {
          console.log(`\n❌ No owner account exists for ${email}`);
          console.log(`   📝 Admin can create account and set password for this owner`);
        }
      }
    }

    console.log('\n🌐 Owner Dashboard Access:');
    console.log('   Login URL: http://localhost:5173/login');
    console.log('   Owner Dashboard: http://localhost:5173/owner/dashboard');
    console.log('   Admin Dashboard: http://localhost:5173/admin/dashboard');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkSivaListings();