const sequelize = require('../src/config/database');
const LeisureLease = require('../src/models/LeisureLease');
const Listing = require('../src/models/Listing');
const User = require('../src/models/User');

async function checkCurrentLeisureStatus() {
  try {
    console.log('🔍 Checking current leisure lease status...');

    // Get all leisure leases with full details
    const leisureLeases = await LeisureLease.findAll({
      include: [
        { 
          model: Listing, 
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'isLeisure']
        },
        { 
          model: User, 
          as: 'tenant',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${leisureLeases.length} leisure lease records`);

    if (leisureLeases.length === 0) {
      console.log('No leisure leases found.');
      return;
    }

    console.log('\n📋 All Leisure Lease Records:');
    console.log('============================');
    leisureLeases.forEach((lease, index) => {
      const statusIcon = lease.status === 'active' && lease.paymentStatus === 'paid' ? '✅' : 
                        lease.status === 'pending' ? '⏳' : '❌';
      console.log(`${index + 1}. ${statusIcon} Lease ID: ${lease.id}`);
      console.log(`   Property: ${lease.property?.title || 'Unknown'} (ID: ${lease.listingId})`);
      console.log(`   Location: ${lease.property?.location || 'Unknown'}`);
      console.log(`   Tenant: ${lease.tenant?.name || 'Unknown'} (${lease.tenant?.email || 'Unknown'})`);
      console.log(`   Year: ${lease.leaseYear}`);
      console.log(`   Status: ${lease.status}`);
      console.log(`   Payment Status: ${lease.paymentStatus}`);
      console.log(`   Amount: ₹${lease.totalAmount}`);
      console.log(`   Start Date: ${lease.startDate}`);
      console.log(`   End Date: ${lease.endDate}`);
      console.log(`   Created: ${lease.createdAt}`);
      console.log(`   Property isLeisure: ${lease.property?.isLeisure}`);
      console.log('---');
    });

    // Check which properties should be hidden from website
    const currentYear = new Date().getFullYear();
    const activeLeases = leisureLeases.filter(lease => 
      lease.status === 'active' && 
      lease.paymentStatus === 'paid' && 
      lease.leaseYear === currentYear
    );

    console.log(`\n🏖️ Properties that should be HIDDEN from website (${currentYear}):`);
    console.log('================================================================');
    if (activeLeases.length === 0) {
      console.log('No properties should be hidden.');
    } else {
      activeLeases.forEach((lease, index) => {
        console.log(`${index + 1}. ${lease.property?.title} (ID: ${lease.listingId})`);
        console.log(`   Leased by: ${lease.tenant?.name}`);
        console.log(`   Year: ${lease.leaseYear}`);
        console.log(`   Amount: ₹${lease.totalAmount}`);
        console.log('---');
      });
    }

    // Check all leisure properties
    const leisureProperties = await Listing.findAll({
      where: { isLeisure: true },
      attributes: ['id', 'title', 'location', 'city', 'status']
    });

    console.log(`\n🏠 All Leisure Properties in Database:`);
    console.log('====================================');
    leisureProperties.forEach((property, index) => {
      const hasActiveLease = activeLeases.some(lease => lease.listingId === property.id);
      const shouldBeHidden = hasActiveLease ? '🚫 SHOULD BE HIDDEN' : '✅ SHOULD BE VISIBLE';
      console.log(`${index + 1}. ${property.title} (ID: ${property.id})`);
      console.log(`   Location: ${property.location}, ${property.city}`);
      console.log(`   Status: ${property.status}`);
      console.log(`   Website Status: ${shouldBeHidden}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error checking leisure lease status:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
checkCurrentLeisureStatus();