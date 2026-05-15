const cron = require('node-cron');
const sequelize = require('../src/config/database');

// Import the notification system
const { checkRentalNotifications } = require('./rentalNotificationSystem');

console.log('🕐 Starting Daily Rental Reminder Service...');

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('\n⏰ Running daily rental payment reminders at', new Date().toLocaleString());
  
  try {
    await checkRentalNotifications();
    console.log('✅ Daily reminder check completed successfully');
  } catch (error) {
    console.error('❌ Daily reminder check failed:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Indian timezone
});

// Also run immediately when script starts (for testing)
console.log('🧪 Running initial check...');
checkRentalNotifications().then(() => {
  console.log('✅ Initial check completed');
}).catch(error => {
  console.error('❌ Initial check failed:', error.message);
});

console.log('📅 Cron job scheduled: Daily at 9:00 AM IST');
console.log('🔄 Service is running... Press Ctrl+C to stop');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Stopping rental reminder service...');
  process.exit(0);
});