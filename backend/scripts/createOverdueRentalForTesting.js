const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const PropertyRental = require('../src/models/PropertyRental');

async function createOverdueRentalForTesting() {
  try {
    console.log('🧪 Creating overdue rental for testing email notifications...\n');

    // Find the user
    const user = await User.findOne({
      where: { email: 'sekharravi406@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    // Update rental to be 3 days overdue
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const rental = await PropertyRental.findOne({
      where: { 
        userId: user.id,
        status: 'active'
      }
    });

    if (!rental) {
      console.log('❌ No active rental found');
      process.exit(1);
    }

    // Update the rental to be 3 days overdue
    await rental.update({
      nextPaymentDue: threeDaysAgo.toISOString().split('T')[0],
      monthlyPaymentStatus: 'overdue'
    });

    console.log('✅ Updated rental to be 3 days overdue');
    console.log('📅 Payment Due Date:', threeDaysAgo.toDateString());
    console.log('📧 User Email:', user.email);
    console.log('🏠 Property:', rental.propertyId);
    console.log('💰 Monthly Rent: ₹' + rental.monthlyRent);

    console.log('\n🧪 Now run the overdue check to send email:');
    console.log('   node scripts/testOverdueEmailNotifications.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createOverdueRentalForTesting();