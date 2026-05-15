const sequelize = require('../src/config/database');

async function checkCurrentStatus() {
  try {
    console.log('📋 Checking current rental and property status...');
    
    const [results] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.status as rentalStatus,
        r.vacateRequested,
        r.vacateDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyPaymentStatus,
        u.email as tenantEmail,
        l.id as propertyId,
        l.title as propertyTitle,
        l.status as propertyStatus
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE u.email IN ('sekharravi406@gmail.com', 'gollapallilikki@gmail.com')
      ORDER BY r.id
    `);
    
    console.log(`\nFound ${results.length} rentals:\n`);
    
    results.forEach((rental, index) => {
      const today = new Date();
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${rental.tenantEmail}`);
      console.log(`   Rental ID: ${rental.rentalId}`);
      console.log(`   Property: ${rental.propertyTitle} (ID: ${rental.propertyId})`);
      console.log(`   Rental Status: ${rental.rentalStatus}`);
      console.log(`   Property Status: ${rental.propertyStatus}`);
      console.log(`   Payment Status: ${rental.monthlyPaymentStatus}`);
      console.log(`   Paid Until: ${rental.paidUntilDate} (${daysLeft} days left)`);
      console.log(`   Next Payment Due: ${rental.nextPaymentDue}`);
      console.log(`   Vacate Requested: ${rental.vacateRequested ? 'Yes' : 'No'}`);
      
      if (rental.rentalStatus === 'active' && rental.propertyStatus === 'rented') {
        console.log(`   🟢 STATUS: Active rental - property hidden from website`);
      } else if (rental.rentalStatus === 'active' && rental.propertyStatus === 'active') {
        console.log(`   ⚠️  STATUS: Active rental but property visible on website (needs fix)`);
      } else {
        console.log(`   ❓ STATUS: ${rental.rentalStatus} rental, ${rental.propertyStatus} property`);
      }
      console.log('');
    });
    
    // Check if properties are visible on website
    console.log('🌐 Checking property visibility on website...');
    const [visibleProperties] = await sequelize.query(`
      SELECT id, title, status, category
      FROM listings 
      WHERE id IN (2, 15) AND category = 'property_rent'
      ORDER BY id
    `);
    
    console.log(`\nProperty visibility status:`);
    visibleProperties.forEach(prop => {
      console.log(`- ${prop.title} (ID: ${prop.id}): ${prop.status}`);
      if (prop.status === 'active') {
        console.log(`  🌐 VISIBLE on website (available for rent)`);
      } else if (prop.status === 'rented') {
        console.log(`  🔒 HIDDEN from website (currently rented)`);
      }
    });
    
    console.log('\n✅ Status check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    process.exit(1);
  }
}

checkCurrentStatus();