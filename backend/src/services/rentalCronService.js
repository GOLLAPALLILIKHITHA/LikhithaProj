const cron = require('node-cron');
const { sendRentReminders, checkOverduePayments, checkSubscriptionExpirations } = require('../controllers/rentalController');

class RentalCronService {
  static start() {
    console.log('🏠 Starting Rental Management Cron Jobs...');

    // Daily check for rent reminders (runs at 9 AM every day)
    cron.schedule('0 9 * * *', async () => {
      console.log('📅 Running daily rent reminder check...');
      try {
        await sendRentReminders();
        console.log('✅ Rent reminders sent successfully');
      } catch (error) {
        console.error('❌ Error sending rent reminders:', error);
      }
    });

    // Daily check for overdue payments with email notifications (runs at 10 AM every day)
    cron.schedule('0 10 * * *', async () => {
      console.log('⚠️ Running overdue payment check with email notifications...');
      try {
        await checkOverduePayments();
        console.log('✅ Overdue payment check with emails completed');
      } catch (error) {
        console.error('❌ Error checking overdue payments:', error);
      }
    });

    // Additional check at 6 PM for overdue payments (catches 2-3 day overdue)
    cron.schedule('0 18 * * *', async () => {
      console.log('🌆 Evening overdue payment check...');
      try {
        await checkOverduePayments();
        console.log('✅ Evening overdue check completed');
      } catch (error) {
        console.error('❌ Error in evening overdue check:', error);
      }
    });

    // Daily check for subscription expirations (runs at 8 AM every day)
    cron.schedule('0 8 * * *', async () => {
      console.log('📅 Running daily subscription expiration check...');
      try {
        const result = await checkSubscriptionExpirations();
        console.log(`✅ Subscription expiration check completed: ${result.count} warnings sent`);
      } catch (error) {
        console.error('❌ Error checking subscription expirations:', error);
      }
    });

    // Weekly summary report (runs at 9 AM every Monday)
    cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Generating weekly rental summary...');
      try {
        await this.generateWeeklySummary();
        console.log('✅ Weekly summary generated');
      } catch (error) {
        console.error('❌ Error generating weekly summary:', error);
      }
    });

    console.log('✅ Rental Management Cron Jobs started successfully');
    console.log('📧 Email notifications will be sent:');
    console.log('   - 1 day before rent due (9 AM daily)');
    console.log('   - 2-3 days after overdue (10 AM & 6 PM daily)');
    console.log('   - 3 days before subscription expiration (8 AM daily)');
  }

  static async generateWeeklySummary() {
    // This can be expanded to generate weekly reports
    // For now, just log the summary
    const RentalAgreement = require('../models/RentalAgreement');
    const { Op } = require('sequelize');

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeAgreements = await RentalAgreement.count({
      where: { status: 'active' }
    });

    const overdueAgreements = await RentalAgreement.count({
      where: {
        status: 'active',
        nextRentDueDate: { [Op.lt]: today }
      }
    });

    console.log(`📊 Weekly Rental Summary:
    - Active Agreements: ${activeAgreements}
    - Overdue Payments: ${overdueAgreements}
    - Overdue Rate: ${((overdueAgreements / activeAgreements) * 100).toFixed(1)}%`);
  }

  // Manual trigger functions for testing
  static async triggerRentReminders() {
    console.log('🔄 Manually triggering rent reminders...');
    await sendRentReminders();
  }

  static async triggerOverdueCheck() {
    console.log('🔄 Manually triggering overdue check...');
    await checkOverduePayments();
  }
}

module.exports = RentalCronService;