const sequelize = require('../src/config/database');
const { checkOverduePayments } = require('../src/controllers/rentalController');

async function testOverdueEmailNotifications() {
  try {
    console.log('🧪 Testing Overdue Email Notifications System...\n');

    // Run the overdue payment check manually
    await checkOverduePayments();

    console.log('\n✅ Test completed successfully!');
    console.log('\n📧 Email Notification Schedule:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 Reminder Emails: 1 day BEFORE rent due');
    console.log('🚨 Overdue Emails: 2-3 days AFTER rent overdue');
    console.log('⏰ Automatic Schedule:');
    console.log('   - 9:00 AM: Rent reminders');
    console.log('   - 10:00 AM: Overdue checks');
    console.log('   - 6:00 PM: Additional overdue checks');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOverdueEmailNotifications();