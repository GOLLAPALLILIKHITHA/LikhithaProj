const sequelize = require('../src/config/database');

async function cleanupRentals() {
  try {
    console.log('🧹 Cleaning up rental accounts...');
    
    // First, let's see all current rentals
    const [rentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.userId,
        u.name as tenantName,
        u.email as tenantEmail,
        l.title as propertyTitle,
        r.startDate,
        r.paidUntilDate,
        r.status
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      ORDER BY r.id
    `);
    
    console.log('\n📊 Current Rentals:');
    rentals.forEach((rental, index) => {
      console.log(`${index + 1}. ID: ${rental.id} - ${rental.tenantName} (${rental.tenantEmail}) - ${rental.propertyTitle} - Status: ${rental.status}`);
    });
    
    // Find Likhotha's rentals (gollapallilikki@gmail.com)
    const likhothRentals = rentals.filter(r => r.tenantEmail === 'gollapallilikki@gmail.com');
    
    if (likhothRentals.length > 0) {
      console.log(`\n🗑️ Removing ${likhothRentals.length} rental(s) from Likhotha's account:`);
      
      for (const rental of likhothRentals) {
        console.log(`- Removing rental ID ${rental.id} (${rental.propertyTitle})`);
        
        // Delete monthly payments first (foreign key constraint)
        await sequelize.query(`DELETE FROM monthly_payments WHERE rentalId = ?`, {
          replacements: [rental.id]
        });
        
        // Delete the rental
        await sequelize.query(`DELETE FROM property_rentals WHERE id = ?`, {
          replacements: [rental.id]
        });
        
        console.log(`✅ Deleted rental ID ${rental.id}`);
      }
    } else {
      console.log('\n✅ No rentals found for Likhotha account');
    }
    
    // Show remaining rentals
    const [remainingRentals] = await sequelize.query(`
      SELECT 
        r.id,
        r.userId,
        u.name as tenantName,
        u.email as tenantEmail,
        l.title as propertyTitle,
        r.startDate,
        r.paidUntilDate,
        r.monthlyRent,
        r.status
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      ORDER BY r.id
    `);
    
    console.log('\n📊 Remaining Rentals:');
    if (remainingRentals.length === 0) {
      console.log('❌ No rentals remaining!');
    } else {
      remainingRentals.forEach((rental, index) => {
        console.log(`${index + 1}. ID: ${rental.id} - ${rental.tenantName} (${rental.tenantEmail})`);
        console.log(`   Property: ${rental.propertyTitle}`);
        console.log(`   Start: ${rental.startDate}, Paid Until: ${rental.paidUntilDate}`);
        console.log(`   Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}`);
        console.log(`   Status: ${rental.status}`);
      });
    }
    
    console.log('\n🎉 Cleanup completed!');
    console.log('\n📋 Now you have:');
    console.log('✅ Only sekharravi406@gmail.com (siva) has rental');
    console.log('✅ Clean database with single test account');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

cleanupRentals();