const sequelize = require('../src/config/database');

async function checkFullStatus() {
  try {
    console.log('🔍 Checking full rental status after admin approval...');
    
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.paidUntilDate,
        r.endDate,
        r.monthlyPaymentStatus,
        u.email as tenantEmail,
        l.id as listingId,
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
      console.log('\n📋 Current Status:');
      console.log(`Tenant: ${r.tenantEmail}`);
      console.log(`Property: ${r.propertyTitle} (ID: ${r.listingId})`);
      console.log(`Rental ID: ${r.id}`);
      console.log(`Rental Status: ${r.status}`);
      console.log(`Vacate Requested: ${r.vacateRequested}`);
      console.log(`Vacate Date: ${r.vacateDate}`);
      console.log(`End Date: ${r.endDate}`);
      console.log(`Property Status: ${r.propertyStatus}`);
      console.log(`Monthly Payment Status: ${r.monthlyPaymentStatus}`);
      
      console.log('\n🎯 Analysis:');
      if (r.vacateRequested && r.status === 'active') {
        console.log('❌ ISSUE: Vacate requested but rental still active');
        console.log('   This is why admin panel still shows "Approve Vacate" button');
        console.log('   Need to complete the vacate process');
      } else if (r.status === 'completed') {
        console.log('✅ Vacate completed successfully');
      } else {
        console.log(`⚠️  Status: ${r.status}`);
      }
      
      if (r.propertyStatus === 'active') {
        console.log('✅ Property is available on website');
      } else if (r.propertyStatus === 'rented') {
        console.log('❌ Property still marked as rented (should be available)');
      }
    } else {
      console.log('❌ No rental found for sekharravi406@gmail.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFullStatus();