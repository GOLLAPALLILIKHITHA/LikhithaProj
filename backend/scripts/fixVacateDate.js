const sequelize = require('../src/config/database');

async function fixVacateDate() {
  try {
    console.log('🔧 Fixing vacate date from Oct 5 to May 10...');
    
    // Update the vacate date from 2026-10-05 to 2026-05-10
    await sequelize.query(`
      UPDATE property_rentals 
      SET vacateDate = '2026-05-10'
      WHERE vacateDate = '2026-10-05' 
      AND vacateRequested = true
    `);
    
    console.log('✅ Vacate date corrected to May 10, 2026');
    
    // Verify the change
    const [results] = await sequelize.query(`
      SELECT 
        vacateDate, 
        paidUntilDate,
        id
      FROM property_rentals 
      WHERE vacateRequested = true
    `);
    
    if (results.length > 0) {
      const r = results[0];
      console.log(`\nCorrected details:`);
      console.log(`Rental ID: ${r.id}`);
      console.log(`Vacate date: ${r.vacateDate} (May 10, 2026)`);
      console.log(`Paid until: ${r.paidUntilDate} (May 14, 2026)`);
      
      const vacateDate = new Date(r.vacateDate);
      const paidUntil = new Date(r.paidUntilDate);
      const isWithinPaidPeriod = vacateDate <= paidUntil;
      
      console.log(`\n✅ Status: ${isWithinPaidPeriod ? 'Within paid period - Admin approval required' : 'After paid period - Payment required'}`);
      
      if (isWithinPaidPeriod) {
        console.log('🎯 This vacate request should now show in admin panel for approval!');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixVacateDate();