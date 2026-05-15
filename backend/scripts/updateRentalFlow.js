const sequelize = require('../src/config/database');

async function updateRentalFlow() {
  try {
    console.log('🔄 Updating rental flow for property visibility...');

    // Update all active rentals to set their properties as 'rented'
    const [updatedListings] = await sequelize.query(`
      UPDATE Listings 
      SET status = 'rented' 
      WHERE id IN (
        SELECT DISTINCT listingId 
        FROM property_rentals 
        WHERE status = 'active' AND paymentStatus = 'paid'
      ) AND status = 'active'
    `);

    console.log(`✅ Updated ${updatedListings.affectedRows || 0} property listings to 'rented' status`);

    // Show current rental statistics
    const [rentalStats] = await sequelize.query(`
      SELECT 
        pr.status as rental_status,
        l.status as listing_status,
        COUNT(*) as count
      FROM property_rentals pr
      JOIN Listings l ON pr.listingId = l.id
      GROUP BY pr.status, l.status
      ORDER BY pr.status, l.status
    `);

    console.log('\n📊 Current Rental & Listing Status:');
    rentalStats.forEach(stat => {
      console.log(`   Rental: ${stat.rental_status} | Listing: ${stat.listing_status} | Count: ${stat.count}`);
    });

    // Show properties that are rented (hidden from website)
    const [rentedProperties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.city,
        l.status as listing_status,
        pr.status as rental_status,
        u.name as tenant_name
      FROM Listings l
      JOIN property_rentals pr ON l.id = pr.listingId
      JOIN Users u ON pr.userId = u.id
      WHERE l.status = 'rented' AND pr.status = 'active'
      LIMIT 5
    `);

    if (rentedProperties.length > 0) {
      console.log('\n🏠 Sample Rented Properties (Hidden from Website):');
      rentedProperties.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.title} in ${prop.city}`);
        console.log(`      Tenant: ${prop.tenant_name}`);
        console.log(`      Status: Listing=${prop.listing_status}, Rental=${prop.rental_status}`);
      });
    }

    console.log('\n🎉 Rental flow updated successfully!');
    console.log('\n📋 How it works now:');
    console.log('   ✅ When payment is completed → Property status becomes "rented"');
    console.log('   ✅ Rented properties are hidden from website listings');
    console.log('   ✅ Users can see full property details in their rental dashboard');
    console.log('   ✅ Admin can "Remove from Rental" to make property available again');
    console.log('   ✅ Monthly payment reminders are sent automatically');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating rental flow:', error);
    process.exit(1);
  }
}

updateRentalFlow();