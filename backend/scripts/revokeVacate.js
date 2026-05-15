const sequelize = require('../src/config/database');

async function revokeVacate() {
  try {
    console.log('🔄 Revoking vacate and restoring rentals...');
    
    // 1. Check current rental status
    const [rentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.endDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        u.email as tenantEmail,
        l.id as listingId,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email IN ('sekharravi406@gmail.com', 'gollapallilikki@gmail.com')
      ORDER BY r.id
    `);
    
    console.log('\n📊 Current Rental Status:');
    rentals.forEach((rental, index) => {
      console.log(`${index + 1}. ${rental.tenantEmail}`);
      console.log(`   Property: ${rental.propertyTitle} (ID: ${rental.listingId})`);
      console.log(`   Rental Status: ${rental.status}`);
      console.log(`   Property Status: ${rental.propertyStatus}`);
      console.log(`   Vacate Requested: ${rental.vacateRequested ? 'Yes' : 'No'}`);
      console.log(`   Vacate Date: ${rental.vacateDate || 'N/A'}`);
      console.log(`   Paid Until: ${rental.paidUntilDate}`);
    });
    
    // 2. Restore completed/cancelled rentals back to active
    console.log('\n🔄 Restoring rentals to active status...');
    
    for (const rental of rentals) {
      if (rental.status === 'completed' || rental.status === 'cancelled') {
        console.log(`\n🔧 Restoring rental for ${rental.tenantEmail}:`);
        
        // Calculate new dates if needed
        let paidUntilDate = rental.paidUntilDate;
        let nextPaymentDue = rental.nextPaymentDue;
        
        // If paid until date is in the past, extend it
        const today = new Date();
        const paidUntil = new Date(paidUntilDate);
        
        if (paidUntil < today) {
          // Extend paid until date to future
          const newPaidUntil = new Date(today);
          newPaidUntil.setDate(newPaidUntil.getDate() + 10); // 10 days from today
          paidUntilDate = newPaidUntil.toISOString().split('T')[0];
          
          const newNextDue = new Date(newPaidUntil);
          newNextDue.setMonth(newNextDue.getMonth() + 1);
          nextPaymentDue = newNextDue.toISOString().split('T')[0];
          
          console.log(`   📅 Extended paid until: ${paidUntilDate}`);
          console.log(`   📅 Next payment due: ${nextPaymentDue}`);
        }
        
        // Update rental to active status
        await sequelize.query(`
          UPDATE property_rentals 
          SET 
            status = 'active',
            vacateRequested = false,
            vacateDate = NULL,
            vacateReason = NULL,
            endDate = NULL,
            paidUntilDate = ?,
            nextPaymentDue = ?,
            monthlyPaymentStatus = 'current',
            adminNotes = CONCAT(COALESCE(adminNotes, ''), ' | Vacate revoked - rental restored to active')
          WHERE id = ?
        `, {
          replacements: [paidUntilDate, nextPaymentDue, rental.id]
        });
        
        console.log(`   ✅ Rental restored to active status`);
        
        // Update property status back to rented
        await sequelize.query(`
          UPDATE listings 
          SET status = 'rented' 
          WHERE id = ?
        `, {
          replacements: [rental.listingId]
        });
        
        console.log(`   ✅ Property status changed to 'rented' (hidden from website)`);
      } else {
        console.log(`\n✅ ${rental.tenantEmail} rental is already active`);
      }
    }
    
    // 3. Show final status
    const [finalRentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyPaymentStatus,
        u.email as tenantEmail,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email IN ('sekharravi406@gmail.com', 'gollapallilikki@gmail.com')
      ORDER BY r.id
    `);
    
    console.log('\n🎉 Final Status After Revoke:');
    finalRentals.forEach((rental, index) => {
      const today = new Date();
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. ${rental.tenantEmail}`);
      console.log(`   Property: ${rental.propertyTitle}`);
      console.log(`   Rental Status: ${rental.status}`);
      console.log(`   Property Status: ${rental.propertyStatus}`);
      console.log(`   Payment Status: ${rental.monthlyPaymentStatus}`);
      console.log(`   Paid Until: ${rental.paidUntilDate} (${daysLeft} days left)`);
      console.log(`   Next Payment Due: ${rental.nextPaymentDue}`);
      console.log(`   Vacate Requested: ${rental.vacateRequested ? 'Yes' : 'No'}`);
      
      if (rental.status === 'active' && rental.propertyStatus === 'rented') {
        console.log(`   🟢 STATUS: Active rental - property hidden from website`);
      } else {
        console.log(`   ⚠️  STATUS: Needs attention`);
      }
    });
    
    console.log('\n✅ Vacate revoked successfully!');
    console.log('\n📋 What was restored:');
    console.log('✅ Rentals changed from completed/cancelled → active');
    console.log('✅ Properties changed from available → rented (hidden from website)');
    console.log('✅ Vacate requests removed');
    console.log('✅ Payment dates extended if needed');
    console.log('✅ Users can now see active rentals in their dashboard');
    console.log('✅ Admin can see active rentals (no vacate requests)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error revoking vacate:', error.message);
    process.exit(1);
  }
}

revokeVacate();