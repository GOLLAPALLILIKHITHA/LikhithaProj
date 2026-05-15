// Test associations directly without importing associations.js
const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');
const LeisureLease = require('../src/models/LeisureLease');
const User = require('../src/models/User');

async function testAssociationsDirectly() {
  try {
    console.log('🧪 Testing associations directly...');

    // Define associations directly here
    console.log('Setting up associations...');
    
    // Clear any existing associations first
    Listing.associations = {};
    LeisureLease.associations = {};
    User.associations = {};

    // Set up associations
    Listing.hasMany(LeisureLease, { foreignKey: 'listingId', as: 'leisureLeases' });
    LeisureLease.belongsTo(Listing, { foreignKey: 'listingId', as: 'property' });
    
    User.hasMany(LeisureLease, { foreignKey: 'userId', as: 'leisureLeases' });
    LeisureLease.belongsTo(User, { foreignKey: 'userId', as: 'tenant' });

    console.log('✅ Associations set up');

    // Test the query
    const currentYear = new Date().getFullYear();
    console.log(`Testing query for year: ${currentYear}`);

    const listings = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      include: [
        {
          model: LeisureLease,
          as: 'leisureLeases',
          required: false,
          where: {
            leaseYear: currentYear,
            status: 'active',
            paymentStatus: 'paid'
          }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\n📋 Found ${listings.length} rental properties:`);
    listings.forEach((listing, index) => {
      const hasActiveLeases = listing.leisureLeases && listing.leisureLeases.length > 0;
      const shouldBeVisible = !listing.isLeisure || !hasActiveLeases;
      const visibilityStatus = shouldBeVisible ? '✅ VISIBLE' : '🚫 HIDDEN';
      
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
      console.log(`   isLeisure: ${listing.isLeisure}`);
      console.log(`   Active Leases: ${listing.leisureLeases?.length || 0}`);
      console.log(`   Should be: ${visibilityStatus}`);
      console.log('---');
    });

    // Apply filtering
    const availableListings = listings.filter(listing => {
      if (!listing.isLeisure) return true;
      return !listing.leisureLeases || listing.leisureLeases.length === 0;
    });

    console.log(`\n🌐 After filtering - Should appear on website:`);
    console.log('==============================================');
    availableListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total: ${listings.length}, Visible: ${availableListings.length}, Hidden: ${listings.length - availableListings.length}`);

  } catch (error) {
    console.error('❌ Error testing associations:', error);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testAssociationsDirectly();