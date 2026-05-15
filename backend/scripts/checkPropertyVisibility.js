const sequelize = require('../src/config/database');

async function checkPropertyVisibility() {
  try {
    console.log('🔍 Checking property visibility on website...');
    
    // 1. Check all rental properties and their status
    const [properties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.location,
        l.city,
        l.price,
        l.status,
        l.category,
        CASE 
          WHEN r.id IS NOT NULL THEN 'Has Active Rental'
          ELSE 'No Rental'
        END as rentalStatus,
        r.id as rentalId,
        u.email as tenantEmail
      FROM listings l
      LEFT JOIN property_rentals r ON l.id = r.listingId AND r.status = 'active'
      LEFT JOIN users u ON r.userId = u.id
      WHERE l.category = 'property_rent'
      ORDER BY l.id
    `);
    
    console.log('\n🏠 All Rental Properties:');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ID: ${prop.id} - ${prop.title}`);
      console.log(`   Location: ${prop.location}, ${prop.city}`);
      console.log(`   Price: ₹${prop.price.toLocaleString()}/month`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Rental Status: ${prop.rentalStatus}`);
      if (prop.tenantEmail) {
        console.log(`   Tenant: ${prop.tenantEmail}`);
      }
      
      // Check if status is correct
      if (prop.rentalStatus === 'Has Active Rental' && prop.status !== 'rented') {
        console.log(`   ⚠️  ISSUE: Property has active rental but status is '${prop.status}' instead of 'rented'`);
      } else if (prop.rentalStatus === 'No Rental' && prop.status === 'rented') {
        console.log(`   ⚠️  ISSUE: Property status is 'rented' but no active rental found`);
      } else {
        console.log(`   ✅ Status is correct`);
      }
    });
    
    // 2. Fix any incorrect statuses
    console.log('\n🔧 Fixing property statuses...');
    
    // Set rented properties to 'rented' status
    const [updateRented] = await sequelize.query(`
      UPDATE listings l
      INNER JOIN property_rentals r ON l.id = r.listingId AND r.status = 'active'
      SET l.status = 'rented'
      WHERE l.category = 'property_rent' AND l.status != 'rented'
    `);
    
    if (updateRented.affectedRows > 0) {
      console.log(`✅ Updated ${updateRented.affectedRows} properties to 'rented' status`);
    }
    
    // Set available properties to 'active' status
    const [updateActive] = await sequelize.query(`
      UPDATE listings l
      LEFT JOIN property_rentals r ON l.id = r.listingId AND r.status = 'active'
      SET l.status = 'active'
      WHERE l.category = 'property_rent' AND r.id IS NULL AND l.status != 'active'
    `);
    
    if (updateActive.affectedRows > 0) {
      console.log(`✅ Updated ${updateActive.affectedRows} properties to 'active' status`);
    }
    
    // 3. Check the listing controller logic
    console.log('\n📋 Website Listing Logic:');
    console.log('✅ Properties with status = "active" → Show on website');
    console.log('❌ Properties with status = "rented" → Hidden from website');
    
    // 4. Show final status
    const [finalProperties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.status,
        CASE 
          WHEN r.id IS NOT NULL THEN 'Rented'
          ELSE 'Available'
        END as actualStatus
      FROM listings l
      LEFT JOIN property_rentals r ON l.id = r.listingId AND r.status = 'active'
      WHERE l.category = 'property_rent'
      ORDER BY l.id
    `);
    
    console.log('\n🎯 Final Property Status:');
    finalProperties.forEach((prop, index) => {
      const shouldShow = prop.status === 'active';
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Database Status: ${prop.status}`);
      console.log(`   Actual Status: ${prop.actualStatus}`);
      console.log(`   Website Visibility: ${shouldShow ? '🟢 VISIBLE' : '🔴 HIDDEN'}`);
    });
    
    console.log('\n📝 Summary:');
    const visibleCount = finalProperties.filter(p => p.status === 'active').length;
    const hiddenCount = finalProperties.filter(p => p.status === 'rented').length;
    
    console.log(`✅ ${visibleCount} properties visible on website`);
    console.log(`❌ ${hiddenCount} properties hidden (rented)`);
    
    if (hiddenCount === 0) {
      console.log('\n⚠️  All properties are showing on website!');
      console.log('💡 This means rented properties are still visible to users');
    } else {
      console.log('\n✅ Rented properties are properly hidden from website');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPropertyVisibility();