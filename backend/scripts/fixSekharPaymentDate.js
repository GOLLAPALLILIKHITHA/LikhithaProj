const sequelize = require('../src/config/database');

async function fixSekharPaymentDate() {
  try {
    console.log('📅 Fixing sekharravi payment date to be due TODAY...');
    
    // 1. Check current rental for sekharravi
    const [currentRental] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.startDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyRent,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email = 'sekharravi406@gmail.com' AND r.status = 'active'
    `);
    
    if (currentRental.length === 0) {
      console.log('❌ No active rental found for sekharravi406@gmail.com');
      return;
    }
    
    const rental = currentRental[0];
    console.log('\n📊 Current Rental:');
    console.log(`- Rental ID: ${rental.rentalId}`);
    console.log(`- Property: ${rental.propertyTitle}`);
    console.log(`- Start Date: ${rental.startDate}`);
    console.log(`- Paid Until: ${rental.paidUntilDate}`);
    console.log(`- Next Due: ${rental.nextPaymentDue}`);
    console.log(`- Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}`);
    
    // 2. Calculate new dates - rental started 1 month ago, paid until TODAY
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const startDate = oneMonthAgo.toISOString().split('T')[0];
    const paidUntilDate = today.toISOString().split('T')[0]; // Paid until today (due today)
    
    const nextPaymentDue = new Date(today);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    const nextDue = nextPaymentDue.toISOString().split('T')[0];
    
    console.log('\n📅 New Dates:');
    console.log(`- Start Date: ${startDate} (1 month ago)`);
    console.log(`- Paid Until: ${paidUntilDate} (TODAY - payment due!)`);
    console.log(`- Next Due: ${nextDue} (after payment)`);
    
    // 3. Update the rental dates
    console.log('\n🔧 Updating rental dates...');
    
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        startDate = ?,
        paidUntilDate = ?,
        nextPaymentDue = ?,
        paymentDayOfMonth = ?,
        monthlyPaymentStatus = 'due',
        lastPaymentDate = ?
      WHERE id = ?
    `, {
      replacements: [
        startDate,
        paidUntilDate,
        nextDue,
        today.getDate(), // Payment day of month
        startDate, // Last payment was when they started
        rental.rentalId
      ]
    });
    
    console.log('✅ Updated rental dates');
    
    // 4. Show final result
    const [updatedRental] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.startDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyRent,
        r.paymentDayOfMonth,
        r.monthlyPaymentStatus,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.id = ?
    `, {
      replacements: [rental.rentalId]
    });
    
    if (updatedRental.length > 0) {
      const r = updatedRental[0];
      const todayDate = new Date();
      const paidUntil = new Date(r.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('\n🎉 Updated Rental for sekharravi406@gmail.com:');
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Monthly Rent: ₹${r.monthlyRent.toLocaleString()}`);
      console.log(`- Start Date: ${r.startDate}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Payment Day: ${r.paymentDayOfMonth}th of every month`);
      console.log(`- Status: ${r.monthlyPaymentStatus}`);
      
      if (daysLeft <= 0) {
        console.log(`- 🔴 PAYMENT DUE TODAY! (${Math.abs(daysLeft)} days ${daysLeft < 0 ? 'overdue' : 'due'})`);
      } else {
        console.log(`- 🟢 ${daysLeft} days remaining`);
      }
      
      console.log('\n📋 Perfect for Testing:');
      console.log('✅ Payment is due TODAY');
      console.log('✅ User will see "Payment Due Today" message');
      console.log('✅ Can test monthly payment flow');
      console.log('✅ Can test late fee calculation if overdue');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSekharPaymentDate();