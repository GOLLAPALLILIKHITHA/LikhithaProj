const sequelize = require('../src/config/database');

async function checkRentalDates() {
  try {
    console.log('📅 Checking rental payment dates...');
    
    const [rentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.userId,
        r.startDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyRent,
        r.monthlyPaymentStatus,
        r.status,
        u.name as tenantName,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.status = 'active'
      ORDER BY r.id
    `);
    
    console.log(`\n📊 Found ${rentals.length} active rentals:`);
    
    const today = new Date();
    console.log(`📅 Today's Date: ${today.toISOString().split('T')[0]}`);
    
    rentals.forEach((rental, index) => {
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. ${rental.propertyTitle} - ${rental.tenantName}`);
      console.log(`   📧 Email: ${rental.tenantEmail}`);
      console.log(`   📅 Start Date: ${rental.startDate}`);
      console.log(`   💰 Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}`);
      console.log(`   ✅ Paid Until: ${rental.paidUntilDate}`);
      console.log(`   📅 Next Due: ${rental.nextPaymentDue}`);
      console.log(`   📊 Status: ${rental.monthlyPaymentStatus}`);
      
      if (daysLeft > 0) {
        console.log(`   🟢 ACTIVE: ${daysLeft} days remaining`);
      } else if (daysLeft === 0) {
        console.log(`   🟡 DUE TODAY: Payment required today`);
      } else {
        const overdueDays = Math.abs(daysLeft);
        const lateFeePercent = Math.ceil(overdueDays / 2) * 2; // 2% for every 2 days
        const lateFeeAmount = (rental.monthlyRent * lateFeePercent) / 100;
        const totalAmount = parseFloat(rental.monthlyRent) + lateFeeAmount;
        
        console.log(`   🔴 OVERDUE: ${overdueDays} days overdue`);
        console.log(`   💸 Late Fee: ${lateFeePercent}% = ₹${lateFeeAmount.toLocaleString()}`);
        console.log(`   💰 Total Due: ₹${totalAmount.toLocaleString()}`);
      }
    });
    
    console.log('\n🔧 Fixing any incorrect payment statuses...');
    
    // Update payment statuses based on actual dates
    for (const rental of rentals) {
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let correctStatus = 'current';
      if (daysLeft <= 0) {
        correctStatus = 'overdue';
      } else if (daysLeft <= 2) {
        correctStatus = 'due';
      }
      
      if (rental.monthlyPaymentStatus !== correctStatus) {
        await sequelize.query(`
          UPDATE property_rentals 
          SET monthlyPaymentStatus = ? 
          WHERE id = ?
        `, {
          replacements: [correctStatus, rental.id]
        });
        console.log(`✅ Updated rental ${rental.id} status: ${rental.monthlyPaymentStatus} → ${correctStatus}`);
      }
    }
    
    console.log('\n🎉 Rental date check completed!');
    
  } catch (error) {
    console.error('❌ Error checking rental dates:', error.message);
  }
}

checkRentalDates();