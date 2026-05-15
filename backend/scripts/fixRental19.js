const sequelize = require('../src/config/database');

async function fixRental19() {
  try {
    console.log('🔧 Fixing Rental ID 19 (Likki House)...');
    
    // Update rental 19 to properly complete the vacate
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        status = 'completed',
        vacateRequested = false,
        monthlyPaymentStatus = 'completed',
        adminNotes = CONCAT(COALESCE(adminNotes, ''), ' | Vacate completed - admin fixed duplicate approval issue')
      WHERE id = 19
    `);
    
    console.log('✅ Rental 19 status updated to completed');
    console.log('✅ Vacate request cleared');
    
    // Verify the fix
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.endDate,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.id = 19
    `);
    
    if (results.length > 0) {
      const r = results[0];
      console.log('\n🎉 Fixed Status:');
      console.log(`Rental ID: ${r.id}`);
      console.log(`Property: ${r.propertyTitle}`);
      console.log(`Rental Status: ${r.status}`);
      console.log(`Vacate Requested: ${r.vacateRequested ? 'Yes' : 'No'}`);
      console.log(`Property Status: ${r.propertyStatus}`);
      
      if (r.status === 'completed' && !r.vacateRequested) {
        console.log('\n✅ SUCCESS: Admin panel will no longer show "Approve Vacate" for this rental');
      }
    }
    
    // Also clean up any other problematic rentals
    console.log('\n🧹 Cleaning up other rentals with vacate issues...');
    
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        status = 'completed',
        vacateRequested = false,
        monthlyPaymentStatus = 'completed'
      WHERE vacateRequested = true 
      AND status IN ('cancelled', 'pending')
      AND endDate IS NOT NULL
    `);
    
    console.log('✅ All problematic rentals cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing rental:', error.message);
    process.exit(1);
  }
}

fixRental19();