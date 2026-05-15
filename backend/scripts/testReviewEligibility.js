const sequelize = require('../src/config/database');
const PropertyRental = require('../src/models/PropertyRental');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function testReviewEligibility() {
  try {
    console.log('🔄 Testing review eligibility for active rentals...');
    
    // Find an active rental
    const activeRental = await PropertyRental.findOne({
      where: { status: 'active' },
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'category'] }
      ]
    });
    
    if (!activeRental) {
      console.log('❌ No active rentals found');
      return;
    }
    
    console.log('✅ Found active rental:');
    console.log(`   User: ${activeRental.tenant.name} (ID: ${activeRental.tenant.id})`);
    console.log(`   Property: ${activeRental.property.title} (ID: ${activeRental.property.id})`);
    console.log(`   Status: ${activeRental.status}`);
    console.log(`   Payment Status: ${activeRental.paymentStatus}`);
    console.log(`   Start Date: ${activeRental.startDate}`);
    console.log(`   Paid Until: ${activeRental.paidUntilDate}`);
    
    // Check if this rental should be eligible for review
    const today = new Date();
    const startDate = new Date(activeRental.startDate);
    const isStarted = startDate <= today;
    
    console.log(`\n📅 Review Eligibility Check:`);
    console.log(`   Today: ${today.toISOString().split('T')[0]}`);
    console.log(`   Start Date: ${startDate.toISOString().split('T')[0]}`);
    console.log(`   Has Started: ${isStarted}`);
    console.log(`   Status: ${activeRental.status}`);
    console.log(`   Payment Status: ${activeRental.paymentStatus}`);
    
    const shouldBeEligible = isStarted && 
                           ['active', 'completed'].includes(activeRental.status) && 
                           activeRental.paymentStatus === 'paid';
    
    console.log(`\n🎯 Should be eligible for review: ${shouldBeEligible ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Error testing review eligibility:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testReviewEligibility()
  .then(() => {
    console.log('\n🎉 Review eligibility test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Review eligibility test failed:', error);
    process.exit(1);
  });