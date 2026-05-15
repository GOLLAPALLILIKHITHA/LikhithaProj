const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

// Import associations
require('../src/models/associations');

async function checkListingsForAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check total listings count
    const totalListings = await Listing.count();
    console.log(`\n📊 Total listings in database: ${totalListings}`);

    if (totalListings === 0) {
      console.log('❌ No listings found in database');
      console.log('📝 Need to create some sample listings first');
      return;
    }

    // Get all listings with seller info (same as admin endpoint)
    const listings = await Listing.findAll({
      order: [['createdAt', 'DESC']], 
      limit: 10,
      include: [{ 
        model: User, 
        as: 'seller', 
        attributes: ['id', 'name', 'email'],
        required: false // LEFT JOIN to include listings without users
      }],
    });

    console.log(`\n📋 Found ${listings.length} listings:`);
    
    listings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Category: ${listing.category}`);
      console.log(`   Price: ₹${listing.price}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Location: ${listing.location}, ${listing.city}`);
      console.log(`   Contact Email: ${listing.contactEmail}`);
      console.log(`   Seller: ${listing.seller ? `${listing.seller.name} (${listing.seller.email})` : 'No user account'}`);
      console.log(`   Created: ${listing.createdAt}`);
    });

    // Check listings by category
    console.log('\n📊 Listings by category:');
    const categoryStats = await Listing.findAll({
      attributes: [
        'category', 
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.count} listings`);
    });

    // Check listings by status
    console.log('\n📊 Listings by status:');
    const statusStats = await Listing.findAll({
      attributes: [
        'status', 
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    statusStats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat.count} listings`);
    });

    // Test the exact query that admin endpoint uses
    console.log('\n🔍 Testing admin endpoint query...');
    const adminQuery = await Listing.findAndCountAll({
      order: [['createdAt', 'DESC']], 
      limit: 20, 
      offset: 0,
      include: [{ 
        model: User, 
        as: 'seller', 
        attributes: ['id', 'name', 'email'],
        required: false
      }],
    });

    console.log(`✅ Admin query returned ${adminQuery.count} total listings`);
    console.log(`✅ Admin query returned ${adminQuery.rows.length} listings in current page`);

    if (adminQuery.rows.length > 0) {
      console.log('\n✅ Sample listing from admin query:');
      const sample = adminQuery.rows[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   ID: ${sample.id}`);
      console.log(`   Seller: ${sample.seller ? sample.seller.name : 'No seller'}`);
    }

    console.log('\n🌐 Admin Dashboard URL: http://localhost:5173/admin/dashboard');
    console.log('📝 If listings still not showing, check:');
    console.log('   1. Frontend API call to /api/admin/listings');
    console.log('   2. Admin authentication token');
    console.log('   3. Network/CORS issues');
    console.log('   4. Frontend component rendering');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkListingsForAdmin();