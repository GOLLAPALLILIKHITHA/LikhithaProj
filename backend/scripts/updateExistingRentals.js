const sequelize = require('../src/config/database');

async function updateExistingRentals() {
  try {
    console.log('🔄 Updating existing rentals with prepaid structure...');
    
    // Update existing rentals
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        paidUntilDate = DATE_ADD(startDate, INTERVAL 1 MONTH),
        paymentDayOfMonth = DAY(startDate)
      WHERE paidUntilDate IS NULL
    `);
    
    console.log('✅ Updated existing rentals');
    
    // Show updated rentals
    const [results] = await sequelize.query(`
      SELECT 
        id, 
        startDate, 
        paidUntilDate, 
        paymentDayOfMonth, 
        status,
        vacateRequested
      FROM property_rentals 
      ORDER BY id 
      LIMIT 5
    `);
    
    console.log('\n📊 Updated Rentals:');
    results.forEach(r => {
      console.log(`- ID ${r.id}: Start ${r.startDate}, Paid Until ${r.paidUntilDate}, Payment Day ${r.paymentDayOfMonth}th, Status: ${r.status}`);
    });
    
    console.log('\n🎉 All existing rentals updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating rentals:', error.message);
    process.exit(1);
  }
}

updateExistingRentals();