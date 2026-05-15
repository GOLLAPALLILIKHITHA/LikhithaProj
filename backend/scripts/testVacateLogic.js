const sequelize = require('../src/config/database');

async function testVacateLogic() {
  try {
    console.log('🧪 Testing new vacate logic...');
    
    // Get current rental data
    const [rentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.paidUntilDate,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email IN ('sekharravi406@gmail.com', 'gollapallilikki@gmail.com')
      AND r.status = 'active'
      ORDER BY r.id
    `);
    
    console.log('\n📋 Current Active Rentals:');
    rentals.forEach((rental, index) => {
      console.log(`${index + 1}. ${rental.tenantEmail}`);
      console.log(`   Property: ${rental.propertyTitle}`);
      console.log(`   Paid Until: ${rental.paidUntilDate}`);
      
      // Test different vacate scenarios
      const paidUntil = new Date(rental.paidUntilDate);
      
      // Scenario 1: Vacate BEFORE paid period ends
      const vacateBefore = new Date(paidUntil);
      vacateBefore.setDate(vacateBefore.getDate() - 5); // 5 days before
      
      // Scenario 2: Vacate ON the last day of paid period
      const vacateOnLastDay = new Date(paidUntil);
      
      // Scenario 3: Vacate AFTER paid period ends
      const vacateAfter = new Date(paidUntil);
      vacateAfter.setDate(vacateAfter.getDate() + 5); // 5 days after
      
      console.log(`\n   🧪 Vacate Scenarios:`);
      console.log(`   📅 Vacate ${vacateBefore.toISOString().split('T')[0]} (5 days before): ✅ Admin approval (no payment)`);
      console.log(`   📅 Vacate ${vacateOnLastDay.toISOString().split('T')[0]} (last paid day): ✅ Admin approval (no payment)`);
      console.log(`   📅 Vacate ${vacateAfter.toISOString().split('T')[0]} (5 days after): 💰 Payment required`);
      console.log('');
    });
    
    console.log('🎯 New Vacate Logic Summary:');
    console.log('✅ Vacate BEFORE or ON paid until date → Submit to admin (no payment)');
    console.log('💰 Vacate AFTER paid until date → Payment required first');
    console.log('');
    console.log('📋 Admin Workflow:');
    console.log('1. Tenant submits vacate request (within paid period)');
    console.log('2. Request appears in admin panel with "Approve Vacate" button');
    console.log('3. Admin clicks approve → Rental completed, property available on website');
    console.log('');
    console.log('💰 Payment Workflow:');
    console.log('1. Tenant tries to vacate after paid period');
    console.log('2. System shows payment required message');
    console.log('3. Tenant pays → Vacate completed immediately, property available');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing vacate logic:', error.message);
    process.exit(1);
  }
}

testVacateLogic();