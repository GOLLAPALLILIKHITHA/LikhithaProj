const sequelize = require('../src/config/database');
const MonthlyPayment = require('../src/models/MonthlyPayment');
const PropertyRental = require('../src/models/PropertyRental');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const { Op } = require('sequelize');

// Email notification function (you can integrate with your email service)
async function sendPaymentReminder(user, rental, monthlyPayment) {
  console.log(`📧 Sending payment reminder to ${user.name} (${user.email})`);
  console.log(`   Property: ${rental.property.title}`);
  console.log(`   Amount: ₹${monthlyPayment.totalAmount}`);
  console.log(`   Due Date: ${monthlyPayment.dueDate}`);
  console.log(`   Month: ${monthlyPayment.monthNumber} of ${rental.totalMonths}`);
  
  // TODO: Integrate with your email service (SendGrid, Nodemailer, etc.)
  // Example:
  // await emailService.send({
  //   to: user.email,
  //   subject: `Rent Payment Reminder - ${rental.property.title}`,
  //   template: 'payment-reminder',
  //   data: { user, rental, monthlyPayment }
  // });
}

// SMS notification function (you can integrate with your SMS service)
async function sendSMSReminder(user, rental, monthlyPayment) {
  if (user.phone) {
    console.log(`📱 Sending SMS reminder to ${user.phone}`);
    console.log(`   Message: Rent payment of ₹${monthlyPayment.totalAmount} for ${rental.property.title} is due on ${monthlyPayment.dueDate}`);
    
    // TODO: Integrate with your SMS service (Twilio, AWS SNS, etc.)
    // Example:
    // await smsService.send({
    //   to: user.phone,
    //   message: `Rent payment of ₹${monthlyPayment.totalAmount} for ${rental.property.title} is due on ${monthlyPayment.dueDate}. Pay within 2 days to avoid late fees.`
    // });
  }
}

async function processMonthlyPaymentReminders() {
  try {
    console.log('🔄 Processing monthly payment reminders...');
    
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(today.getDate() + 1);
    
    // Find payments due in 2 days (first reminder)
    const upcomingPayments = await MonthlyPayment.findAll({
      where: {
        status: 'pending',
        dueDate: twoDaysFromNow.toISOString().split('T')[0],
        reminderCount: 0
      },
      include: [
        {
          model: PropertyRental,
          as: 'rental',
          include: [
            {
              model: Listing,
              as: 'property',
              attributes: ['title', 'location', 'city']
            }
          ]
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    // Find payments due tomorrow (second reminder)
    const urgentPayments = await MonthlyPayment.findAll({
      where: {
        status: 'pending',
        dueDate: oneDayFromNow.toISOString().split('T')[0],
        reminderCount: 1
      },
      include: [
        {
          model: PropertyRental,
          as: 'rental',
          include: [
            {
              model: Listing,
              as: 'property',
              attributes: ['title', 'location', 'city']
            }
          ]
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    // Find overdue payments
    const overduePayments = await MonthlyPayment.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lt]: today.toISOString().split('T')[0]
        }
      },
      include: [
        {
          model: PropertyRental,
          as: 'rental',
          include: [
            {
              model: Listing,
              as: 'property',
              attributes: ['title', 'location', 'city']
            }
          ]
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    console.log(`📊 Payment Reminder Summary:`);
    console.log(`   Upcoming payments (2 days): ${upcomingPayments.length}`);
    console.log(`   Urgent payments (1 day): ${urgentPayments.length}`);
    console.log(`   Overdue payments: ${overduePayments.length}`);

    // Process upcoming payments (first reminder)
    for (const payment of upcomingPayments) {
      await sendPaymentReminder(payment.tenant, payment.rental, payment);
      await sendSMSReminder(payment.tenant, payment.rental, payment);
      
      // Update reminder count
      payment.reminderCount = 1;
      payment.notificationSent = true;
      await payment.save();
    }

    // Process urgent payments (second reminder)
    for (const payment of urgentPayments) {
      console.log(`⚠️  URGENT: Payment due tomorrow for ${payment.tenant.name}`);
      await sendPaymentReminder(payment.tenant, payment.rental, payment);
      await sendSMSReminder(payment.tenant, payment.rental, payment);
      
      // Update reminder count
      payment.reminderCount = 2;
      await payment.save();
    }

    // Process overdue payments
    for (const payment of overduePayments) {
      console.log(`🚨 OVERDUE: Payment overdue for ${payment.tenant.name}`);
      
      // Calculate late fee (5% of monthly rent)
      const lateFee = payment.rental.monthlyRent * 0.05;
      payment.lateFee = lateFee;
      payment.totalAmount = parseFloat(payment.amount) + lateFee;
      payment.status = 'overdue';
      payment.reminderCount = payment.reminderCount + 1;
      
      await payment.save();
      
      // Update rental status
      payment.rental.monthlyPaymentStatus = 'overdue';
      await payment.rental.save();
      
      await sendPaymentReminder(payment.tenant, payment.rental, payment);
      await sendSMSReminder(payment.tenant, payment.rental, payment);
    }

    console.log('✅ Monthly payment reminders processed successfully!');
    
    // Generate summary report
    const totalReminders = upcomingPayments.length + urgentPayments.length + overduePayments.length;
    if (totalReminders > 0) {
      console.log(`\n📈 Reminder Statistics:`);
      console.log(`   Total reminders sent: ${totalReminders}`);
      console.log(`   First reminders: ${upcomingPayments.length}`);
      console.log(`   Urgent reminders: ${urgentPayments.length}`);
      console.log(`   Overdue notices: ${overduePayments.length}`);
    } else {
      console.log('✨ No payment reminders needed today!');
    }

  } catch (error) {
    console.error('❌ Error processing monthly payment reminders:', error);
  }
}

// Run the reminder system
processMonthlyPaymentReminders()
  .then(() => {
    console.log('🎉 Payment reminder system completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Payment reminder system failed:', error);
    process.exit(1);
  });