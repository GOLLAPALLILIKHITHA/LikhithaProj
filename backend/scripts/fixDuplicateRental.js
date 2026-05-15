const sequelize = require('../src/config/database');

async function fixDuplicateRental() {
  try {
    console.log('🔍 Checking duplicate rental issue...');
    
    // 1. Check current rentals
    const [currentRentals] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.userId,
        r.listingId,
        r.startDate,
        r.paidUntilDate,
        r.status,
        u.email as tenantEmail,
        l.title as propertyTitle,
        l.location as propertyLocation
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.status = 'active'
      ORDER BY r.listingId, r.id
    `);
    
    console.log('\n📊 Current Active Rentals:');
    currentRentals.forEach((rental, index) => {
      console.log(`${index + 1}. Rental ID: ${rental.rentalId}`);
      console.log(`   Property: ${rental.propertyTitle} (ID: ${rental.listingId})`);
      console.log(`   Location: ${rental.propertyLocation}`);
      console.log(`   Tenant: ${rental.tenantEmail}`);
      console.log(`   Paid Until: ${rental.paidUntilDate}`);
    });
    
    // 2. Find duplicate rentals (same property rented by multiple people)
    const [duplicates] = await sequelize.query(`
      SELECT 
        listingId,
        COUNT(*) as rentalCount,
        GROUP_CONCAT(CONCAT(u.email, ' (ID:', r.id, ')') SEPARATOR ', ') as tenants
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.status = 'active'
      GROUP BY listingId
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE RENTALS FOUND:');
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Property ID ${dup.listingId}: ${dup.rentalCount} rentals`);
        console.log(`   Tenants: ${dup.tenants}`);
      });
      
      // 3. Fix the issue - Remove sekharravi's rental from Siva House
      console.log('\n🔧 Fixing duplicate rental issue...');
      
      // Find sekharravi's rental on Siva House (property ID 2)
      const [sekharRental] = await sequelize.query(`
        SELECT r.id 
        FROM property_rentals r
        LEFT JOIN users u ON r.userId = u.id
        WHERE u.email = 'sekharravi406@gmail.com' AND r.listingId = 2 AND r.status = 'active'
      `);
      
      if (sekharRental.length > 0) {
        const rentalId = sekharRental[0].id;
        console.log(`🗑️ Removing sekharravi's rental from Siva House (Rental ID: ${rentalId})`);
        
        // Delete the rental
        await sequelize.query(`DELETE FROM monthly_payments WHERE rentalId = ?`, {
          replacements: [rentalId]
        });
        await sequelize.query(`DELETE FROM property_rentals WHERE id = ?`, {
          replacements: [rentalId]
        });
        
        console.log('✅ Removed duplicate rental');
      }
    } else {
      console.log('\n✅ No duplicate rentals found');
    }
    
    // 4. Create a NEW property for sekharravi
    console.log('\n🏗️ Creating NEW property for sekharravi...');
    
    await sequelize.query(`
      INSERT INTO listings (
        userId, title, description, category, subcategory, price, location, city, state, 
        pincode, bedrooms, bathrooms, area, amenities, images, status, 
        createdAt, updatedAt
      ) VALUES (
        1,
        'Sekhar Test House',
        'Exclusive 2BHK house for sekharravi testing. Independent house with all modern facilities.',
        'property_rent',
        'house',
        16000.00,
        'Sekhar Colony, Block A',
        'Hyderabad',
        'Telangana',
        '500001',
        2,
        2,
        1400,
        '["Parking", "Garden", "Security", "Power Backup", "Bore Well"]',
        '["https://placehold.co/800x600/0f766e/ffffff?text=Sekhar+House"]',
        'active',
        NOW(),
        NOW()
      )
    `);
    
    // Get the new property ID
    const [newProperty] = await sequelize.query(`
      SELECT id FROM listings 
      WHERE title = 'Sekhar Test House' 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    const newPropertyId = newProperty[0].id;
    console.log(`✅ Created new property: Sekhar Test House (ID: ${newPropertyId})`);
    
    // 5. Create rental for sekharravi with the NEW property
    console.log('\n👤 Creating rental for sekharravi with NEW property...');
    
    // Calculate dates - rental started 10 days ago, payment due in 20 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const startDate = tenDaysAgo.toISOString().split('T')[0];
    
    const paidUntilDate = new Date(tenDaysAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1);
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    await sequelize.query(`
      INSERT INTO property_rentals (
        userId, listingId, startDate, monthlyRent, totalAmount,
        advancePayment, firstMonthRent, initialPayment, 
        nextPaymentDue, lastPaymentDate, monthlyPaymentStatus, 
        paidUntilDate, paymentDayOfMonth, vacateRequested, 
        status, paymentStatus, razorpayOrderId, razorpayPaymentId, 
        razorpaySignature, tenantPhone, tenantEmail, notes, 
        createdAt, updatedAt
      ) VALUES (
        1, ${newPropertyId}, '${startDate}', 16000.00, 48000.00,
        32000.00, 16000.00, 48000.00,
        '${nextPaymentDue.toISOString().split('T')[0]}', '${startDate}', 'current',
        '${paidUntilDate.toISOString().split('T')[0]}', ${tenDaysAgo.getDate()}, 0,
        'active', 'paid', 'order_sekhar_new', 'pay_sekhar_new',
        'test_signature', '9876543210', 'sekharravi406@gmail.com', 'Exclusive rental for sekharravi testing',
        NOW(), NOW()
      )
    `);
    
    console.log('✅ Created rental for sekharravi with NEW property');
    
    // Update property status to rented
    await sequelize.query(`UPDATE listings SET status = 'rented' WHERE id = ${newPropertyId}`);
    
    // 6. Show final result
    const [finalRentals] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.listingId,
        r.paidUntilDate,
        r.monthlyRent,
        u.email as tenantEmail,
        l.title as propertyTitle,
        l.location as propertyLocation
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.status = 'active'
      ORDER BY r.id
    `);
    
    console.log('\n🎉 Final Rental Setup:');
    finalRentals.forEach((rental, index) => {
      const today = new Date();
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${rental.tenantEmail}`);
      console.log(`   Property: ${rental.propertyTitle} (ID: ${rental.listingId})`);
      console.log(`   Location: ${rental.propertyLocation}`);
      console.log(`   Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}`);
      console.log(`   Paid Until: ${rental.paidUntilDate} (${daysLeft} days left)`);
    });
    
    console.log('\n✅ Fixed! Now each person has their own separate property:');
    console.log('🏠 gollapallilikki@gmail.com → Siva House');
    console.log('🏠 sekharravi406@gmail.com → Sekhar Test House');
    console.log('✅ No more duplicate rentals on same property');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDuplicateRental();