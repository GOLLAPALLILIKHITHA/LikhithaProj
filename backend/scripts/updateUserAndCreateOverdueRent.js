const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const PropertyRental = require('../src/models/PropertyRental');
const RentNotification = require('../src/models/RentNotification');

async function updateUserAndCreateOverdueRent() {
  try {
    console.log('🔧 Updating user and creating overdue rent...\n');

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

    // 3. Find a property for rent
    const property = await Listing.findOne({
      where: { 
        category: 'property_rent',
        status: 'active'
      }
    });

    if (!property) {
      console.log('❌ No rental property found');
      process.exit(1);
    }

    console.log('✅ Found property:', property.title);

    // 4. Create rental with overdue payment (payment was due yesterday)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 2); // Started 2 months ago
    
    const paidUntil = new Date(yesterday);
    paidUntil.setDate(paidUntil.getDate() - 1); // Paid until 2 days ago
    
    const nextDue = new Date(yesterday); // Due yesterday

    const rental = await PropertyRental.create({
      userId: user.id,
      listingId: property.id,
      startDate: startDate.toISOString().split('T')[0],
      monthlyRent: property.price,
      advancePayment: property.price * 2,
      firstMonthRent: property.price,
      initialPayment: property.price * 3,
      totalAmount: property.price * 12,
      securityDeposit: property.price * 2,
      paidUntilDate: paidUntil.toISOString().split('T')[0],
      nextPaymentDue: nextDue.toISOString().split('T')[0],
      paymentDayOfMonth: yesterday.getDate(),
      lastPaymentDate: paidUntil.toISOString().split('T')[0],
      monthlyPaymentStatus: 'overdue',
      status: 'active',
      paymentStatus: 'overdue',
      tenantPhone: user.phone,
      tenantEmail: user.email
    });

    console.log('✅ Rental created with OVERDUE status');
    console.log('   Monthly Rent: ₹' + rental.monthlyRent);
    console.log('   Paid Until: ' + rental.paidUntilDate);
    console.log('   Next Due: ' + rental.nextPaymentDue + ' (OVERDUE!)');

    // 5. Create overdue payment notification
    const notification = await RentNotification.create({
      rentalAgreementId: rental.id,
      tenantId: user.id,
      type: 'late_payment_warning',
      title: '⚠️ URGENT: Rent Payment Overdue',
      message: `Your rent payment of ₹${rental.monthlyRent} for ${property.title} is OVERDUE! Payment was due on ${nextDue.toLocaleDateString()}. Please pay immediately to avoid late fees. YOU HAVE TO PAY THE RENT NOW!`,
      forMonth: nextDue.toISOString().slice(0, 7),
      dueAmount: rental.monthlyRent,
      overdueMonths: 0,
      status: 'sent',
      sentAt: new Date(),
      sentVia: ['in_app', 'email', 'sms']
    });

    console.log('✅ Overdue notification created');

    // 6. Create rent due reminder
    const reminder = await RentNotification.create({
      rentalAgreementId: rental.id,
      tenantId: user.id,
      type: 'rent_due',
      title: '💰 Rent Payment Due',
      message: `Reminder: Your rent of ₹${rental.monthlyRent} for ${property.title} is due. YOU HAVE TO PAY THE RENT! Please make the payment immediately.`,
      forMonth: nextDue.toISOString().slice(0, 7),
      dueAmount: rental.monthlyRent,
      status: 'sent',
      sentAt: new Date(),
      sentVia: ['in_app', 'email']
    });

    console.log('✅ Rent due reminder created');

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User: ' + user.name);
    console.log('📧 Email: sekharravi406@gmail.com');
    console.log('🔑 Password: 1234');
    console.log('🏠 Property: ' + property.title);
    console.log('💰 Monthly Rent: ₹' + rental.monthlyRent);
    console.log('📅 Payment Status: OVERDUE (due yesterday)');
    console.log('🔔 Notifications: 2 created');
    console.log('   - "YOU HAVE TO PAY THE RENT NOW!"');
    console.log('   - "Rent Payment Due"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ User can now login and see overdue rent notifications!');
    console.log('   Login at: http://localhost:5173/login');
    console.log('   Email: sekharravi406@gmail.com');
    console.log('   Password: 1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserAndCreateOverdueRent();
