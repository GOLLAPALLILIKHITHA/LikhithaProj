const sequelize = require('../src/config/database');

async function checkAllRentals() {
  try {
    console.log('🔍 Checking all rentals for sekharravi406@gmail.com...');
    
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.endDate,
        r.createdAt,
        u.email as tenantEmail,
        l.id as listingId,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email = 'sekharravi406@gmail.com'
      ORDER BY r.id DESC
    `);
    
    console.log(`\nFound ${results.length} rentals:\n`);
    
    results.forEach((r, index) => {
      console.log(`${index + 1}. Rental ID: ${r.id} (Created: ${r.createdAt.toISOString().split('T')[0]})`);
      console.log(`   Property: ${r.propertyTitle} (ID: ${r.listingId})`);
      console.log(`   Rental Status: ${r.status}`);
      console.log(`   Vacate Requested: ${r.vacateRequested ? 'Yes' : 'No'}`);
      console.log(`   Vacate Date: ${r.vacateDate || 'N/A'}`);
      console.log(`   End Date: ${r.endDate || 'N/A'}`);
      console.log(`   Property Status: ${r.propertyStatus}`);
      
      if (r.vacateRequested && r.status !== 'completed') {
        console.log(`   🚨 ISSUE: This rental shows "Approve Vacate" in admin panel`);
      } else if (r.status === 'completed') {
        console.log(`   ✅ GOOD: This rental is properly completed`);
      }
      console.log('');
    });
    
    // Check which rentals need to be fixed
    const needsFix = results.filter(r => r.vacateRequested && r.status !== 'completed');
    if (needsFix.length > 0) {
      console.log('🔧 Rentals that need to be fixed:');
      needsFix.forEach(r => {
        console.log(`- Rental ID ${r.id}: ${r.propertyTitle} (Status: ${r.status}, Vacate: ${r.vacateRequested ? 'Yes' : 'No'})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllRentals();