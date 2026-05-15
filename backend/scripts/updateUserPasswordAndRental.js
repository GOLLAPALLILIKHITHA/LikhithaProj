const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const PropertyRental = require('../src/models/PropertyRental');

async function updateUserPasswordAndRental() {
  try {
    console.log('🔧 Updating user password and rental status...\n');

    // 1. Find existing user
    const user = await User.findOne({
      where: { email: 'sekharravi406@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found: sekharravi406@gmail.com');
      process.exit(1);
    }

    console.log('✅ User found:', user.name, '(' + user.email + ')');

    // 2. Update password to 1234
    user.password = await bcrypt.hash('1234', 10);
    await user.save();
    console.log('✅ Password updated to: 1234');

    // 3. Find user's existing rental
    const rental = await PropertyRental.findOne({
      where: { userId: user.id, status: 'active' }
    });

    if (rental) {
      // Update rental to show overdue status
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      rental.nextPaymentDue = yesterday.toISOString().split('T')[0];
      rental.monthlyPaymentStatus = 'overdue';
      rental.paymentStatus = 'overdue';
      await rental.save();
      
      console.log('✅ Rental updated to OVERDUE status');
      console.log('   Monthly Rent: ₹' + rental.monthlyRent);
      console.log('   Next Due: ' + rental.nextPaymentDue + ' (OVERDUE!)');
    } else {
      console.log('⚠️  No active rental found for this user');
    }

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User: ' + user.name);
    console.log('📧 Email: sekharravi406@gmail.com');
    console.log('🔑 Password: 1234');
    if (rental) {
      console.log('💰 Monthly Rent: ₹' + rental.monthlyRent);
      console.log('📅 Payment Status: OVERDUE');
      console.log('🔔 Notification: "YOU HAVE TO PAY THE RENT!"');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ User can now login!');
    console.log('   Login at: http://localhost:5173/login');
    console.log('   Email: sekharravi406@gmail.com');
    console.log('   Password: 1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserPasswordAndRental();
