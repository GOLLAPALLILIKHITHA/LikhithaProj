const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');
const LeisureLease = require('../src/models/LeisureLease');
const User = require('../src/models/User');

// Import associations to ensure they are loaded
require('../src/models/associations');

async function testListingFilter() {
  try {
    console.log('🧪 Testing listing filter logic...');

    const currentYear = new Date().getFullYear();
    console.log(`Current year: ${currentYear}`);

    // Test the exact query used in listingController
    const listings = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar', 'isVerified'] },
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
    console.log('==========================================');

    listings.forEach((listing, index) => {
      const hasActiveLeases = listing.leisureLeases && listing.leisureLeases.length > 0;
      const shouldBeVisible = !listing.isLeisure || !hasActiveLeases;
      const visibilityStatus = shouldBeVisible ? '✅ VISIBLE' : '🚫 HIDDEN';
      
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
      console.log(`   Location: ${listing.location}, ${listing.city}`);
      console.log(`   isLeisure: ${listing.isLeisure}`);
      console.log(`   Active Leases: ${listing.leisureLeases?.length || 0}`);
      console.log(`   Should be: ${visibilityStatus}`);
      
      if (listing.leisureLeases && listing.leisureLeases.length > 0) {
        listing.leisureLeases.forEach((lease, leaseIndex) => {
          console.log(`     Lease ${leaseIndex + 1}: Year ${lease.leaseYear}, Status: ${lease.status}, Payment: ${lease.paymentStatus}`);
        });
      }
      console.log('---');
    });

    // Apply the filtering logic
    const availableListings = listings.filter(listing => {
      // If it's not a leisure property, always show it
      if (!listing.isLeisure) return true;
      
      // If it's a leisure property, only show if not leased for current year
      return !listing.leisureLeases || listing.leisureLeases.length === 0;
    });

    console.log(`\n🌐 Properties that SHOULD APPEAR on website:`);
    console.log('============================================');
    availableListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
      console.log(`   Location: ${listing.location}, ${listing.city}`);
      console.log(`   isLeisure: ${listing.isLeisure}`);
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total rental properties: ${listings.length}`);
    console.log(`Should be visible: ${availableListings.length}`);
    console.log(`Should be hidden: ${listings.length - availableListings.length}`);

  } catch (error) {
    console.error('❌ Error testing listing filter:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run the function
testListingFilter();