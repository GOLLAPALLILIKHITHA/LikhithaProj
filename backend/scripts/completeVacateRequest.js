const sequelize = require('../src/config/database');

async function completeVacateRequest() {
  try {
    console.log('🔧 Completing the pending vacate request...');
    
    // Update the rental to properly complete the vacate
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        status = 'completed',
        vacateRequested = false,
        endDate = vacateDate,
        monthlyPaymentStatus = 'completed',
        adminNotes = CONCAT(COALESCE(adminNotes, ''), ' | Vacate completed by admin - cleared pending status')
      WHERE vacateRequested = true 
      AND status IN ('cancelled', 'active')
    `);
    
    console.log('✅ Rental status updated to completed');
    
    // Ensure property is available on website
    await sequelize.query(`
      UPDATE listings l
      INNER JOIN property_rentals r ON l.id = r.listingId
      SET l.status = 'active'
      WHERE r.status = 'completed' 
      AND r.endDate IS NOT NULL
      AND l.status = 'rented'
    `);
    
    console.log('✅ Property status updated to active (available on website)');
    
    // Verify the changes
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.endDate,
        u.email as tenantEmail,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email = 'sekharravi406@gmail.com'
      ORDER BY r.id DESC
      LIMIT 1
    `);
    
    if (results.length > 0) {
      const r = results[0];
      console.log('\n🎉 Final Status:');
      console.log(`Tenant: ${r.tenantEmail}`);
      console.log(`Property: ${r.propertyTitle}`);
      console.log(`Rental Status: ${r.status}`);
      console.log(`Vacate Requested: ${r.vacateRequested ? 'Yes' : 'No'}`);
      console.log(`Vacate Date: ${r.vacateDate}`);
      console.log(`End Date: ${r.endDate}`);
      console.log(`Property Status: ${r.propertyStatus}`);
      
      if (r.status === 'completed' && !r.vacateRequested && r.propertyStatus === 'active') {
        console.log('\n✅ SUCCESS: Vacate process completed!');
        console.log('- Rental marked as completed');
        console.log('- Vacate request cleared');
        console.log('- Property available on website');
        console.log('- Admin panel will no longer show "Approve Vacate" button');
      } else {
        console.log('\n⚠️  Some issues may remain - check the status above');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error completing vacate request:', error.message);
    process.exit(1);
  }
}

completeVacateRequest();