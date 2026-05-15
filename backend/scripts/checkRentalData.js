const sequelize = require('../src/config/database');
const PropertyRental = require('../src/models/PropertyRental');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function checkRentalData() {
  try {
    console.log('🔍 Checking existing rental data...\n');

    // Get all property rentals
    const rentals = await PropertyRental.findAll({
      include: [
        { 
          model: User, 
          as: 'tenant', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Listing, 
          as: 'property', 
          attributes: ['id', 'title', 'location', 'city'],
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${rentals.length} rental records:\n`);

    if (rentals.length === 0) {
      console.log('❌ No rental data found in PropertyRental table');
      console.log('💡 You may need to create some test rental data first');
    } else {
      rentals.forEach((rental, index) => {
        console.log(`${index + 1}. 🏠 Property: ${rental.property?.title || 'Unknown'}`);
        console.log(`   📍 Location: ${rental.property?.location || 'Unknown'}, ${rental.property?.city || 'Unknown'}`);
        console.log(`   👤 Tenant: ${rental.tenant?.name || 'Unknown'} (${rental.tenant?.email || 'No email'})`);
        console.log(`   👨‍💼 Owner: ${rental.property?.seller?.name || 'Unknown'} (${rental.property?.seller?.email || 'No email'})`);
        console.log(`   💰 Monthly Rent: ₹${rental.monthlyRent}`);
        console.log(`   📅 Start Date: ${rental.startDate}`);
        console.log(`   📅 End Date: ${rental.endDate || 'Not set'}`);
        console.log(`   📅 Next Payment Due: ${rental.nextPaymentDue || 'Not set'}`);
        console.log(`   📅 Paid Until: ${rental.paidUntilDate || 'Not set'}`);
        console.log(`   🔄 Status: ${rental.status}`);
        console.log(`   💳 Payment Status: ${rental.paymentStatus}`);
        console.log(`   📊 Monthly Payment Status: ${rental.monthlyPaymentStatus}`);
        console.log(`   🚪 Vacate Requested: ${rental.vacateRequested ? 'Yes' : 'No'}`);
        console.log(`   📝 Created: ${rental.createdAt.toLocaleDateString()}`);
        console.log('   ' + '─'.repeat(50));
      });
    }

    // Check for any listings marked as rented
    const rentedListings = await Listing.findAll({
      where: { status: 'rented' },
      attributes: ['id', 'title', 'location', 'city', 'status'],
      include: [
        { model: User, as: 'seller', attributes: ['name', 'email'] }
      ]
    });

    console.log(`\n🏠 Found ${rentedListings.length} listings marked as 'rented':`);
    rentedListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.location}, ${listing.city}`);
      console.log(`   Owner: ${listing.seller?.name} (${listing.seller?.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking rental data:', error);
    process.exit(1);
  }
}

checkRentalData();