const sequelize = require('../src/config/database');

async function updateTestRentalDates() {
  try {
    console.log('📅 Updating test rental dates for better demo...');
    
    // Set rental to have 3 days left (so user can see the "active until" message)
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const nextPaymentDue = new Date(threeDaysFromNow);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    // Update the rental for user sekharravi406@gmail.com
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        paidUntilDate = '${threeDaysFromNow.toISOString().split('T')[0]}',
        nextPaymentDue = '${nextPaymentDue.toISOString().split('T')[0]}',
        monthlyPaymentStatus = 'current'
      WHERE userId = 1
    `);
    
    console.log('✅ Updated rental dates');
    
    // Show updated rental
    const [rentals] = await sequelize.query(`
      SELECT 
        r.*,
        l.title as propertyTitle,
        u.email as userEmail
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.userId = 1
      ORDER BY r.id DESC
      LIMIT 1
    `);
    
    if (rentals.length > 0) {
      const r = rentals[0];
      console.log('\n🏠 Updated Test Rental:');
      console.log(`- User: ${r.userEmail}`);
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Next Payment Due: ${r.nextPaymentDue}`);
      console.log(`- Status: ${r.monthlyPaymentStatus}`);
      
      const daysLeft = Math.ceil((new Date(r.paidUntilDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`- Days Left: ${daysLeft} days`);
      
      console.log('\n📋 Now when user clicks "Pay Monthly Rent":');
      console.log(`✅ Will show: "Your rental is active until ${r.paidUntilDate}"`);
      console.log(`✅ Will show: "You have ${daysLeft} days remaining"`);
      console.log('✅ Will ask: "Do you want to pay in advance?"');
    }
    
    console.log('\n🎉 Test scenario updated for better demo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateTestRentalDates();