const sequelize = require('../src/config/database');

async function checkVacateRequest() {
  try {
    console.log('🔍 Checking current vacate requests...');
    
    const [results] = await sequelize.query(`
      SELECT 
        r.id,
        r.vacateRequested,
        r.vacateDate,
        r.paidUntilDate,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.vacateRequested = true
      ORDER BY r.id
    `);
    
    if (results.length === 0) {
      console.log('❌ No vacate requests found');
    } else {
      console.log(`Found ${results.length} vacate request(s):`);
      results.forEach((r, index) => {
        console.log(`\n${index + 1}. ${r.tenantEmail}: ${r.propertyTitle}`);
        console.log(`   Vacate Date (raw in DB): ${r.vacateDate}`);
        console.log(`   Paid Until: ${r.paidUntilDate}`);
        
        // Parse the date different ways to see the issue
        const vacateDate = new Date(r.vacateDate);
        console.log(`   Vacate Date (JS Date): ${vacateDate}`);
        console.log(`   Vacate Date (toLocaleDateString): ${vacateDate.toLocaleDateString('en-IN')}`);
        console.log(`   Vacate Date (toISOString): ${vacateDate.toISOString().split('T')[0]}`);
        
        // Check if it's within paid period
        const paidUntil = new Date(r.paidUntilDate);
        const isWithinPaidPeriod = vacateDate <= paidUntil;
        console.log(`   Within paid period: ${isWithinPaidPeriod ? 'Yes' : 'No'}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkVacateRequest();