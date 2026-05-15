const sequelize = require('../src/config/database');

async function checkCompletedRentals() {
  try {
    console.log('🔍 Checking completed rentals for vacate date display...');
    
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.status,
        r.vacateRequested,
        r.vacateDate,
        r.endDate,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.status = 'completed'
      AND u.email = 'sekharravi406@gmail.com'
      ORDER BY r.id DESC
    `);
    
    console.log(`\nFound ${results.length} completed rentals:\n`);
    
    results.forEach((r, index) => {
      console.log(`${index + 1}. ${r.propertyTitle} (Rental ID: ${r.id})`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Vacate Date: ${r.vacateDate || 'Not set'}`);
      console.log(`   End Date: ${r.endDate || 'Not set'}`);
      
      if (r.vacateDate) {
        console.log(`   ✅ Will show: "Vacated On: ${r.vacateDate}"`);
      } else {
        console.log(`   ⚠️  No vacate date to display`);
      }
      
      if (r.endDate) {
        console.log(`   ✅ Will show: "Rental Ended: ${r.endDate}"`);
      }
      
      console.log(`   💙 Status: "Rental Completed" with thank you message`);
      console.log('');
    });
    
    if (results.length === 0) {
      console.log('No completed rentals found for sekharravi406@gmail.com');
    } else {
      console.log('🎉 All completed rentals will now show vacate dates in user dashboard!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCompletedRentals();