const sequelize = require('../src/config/database');

async function createNewRentalProperty() {
  try {
    console.log('🏗️ Creating new rental property for sekharravi406@gmail.com...');
    
    // 1. First, let's see current properties
    const [currentProperties] = await sequelize.query(`
      SELECT id, title, location, city, price, status, category 
      FROM listings 
      WHERE category = 'property_rent'
      ORDER BY id
    `);
    
    console.log('\n🏠 Current rental properties:');
    currentProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ID: ${prop.id} - ${prop.title} - ${prop.location}, ${prop.city} - ₹${prop.price.toLocaleString()}/month - Status: ${prop.status}`);
    });
    
    // 2. Create a NEW rental property
    console.log('\n🏗️ Creating new rental property...');
    
    await sequelize.query(`
      INSERT INTO listings (
        userId, title, description, category, subcategory, price, location, city, state, 
        pincode, bedrooms, bathrooms, area, amenities, images, status, 
        createdAt, updatedAt
      ) VALUES (
        1,
        'Premium Test Villa',
        'Spacious 3BHK villa with garden, perfect for testing rental features. Modern amenities and prime location.',
        'property_rent',
        'villa',
        18000.00,
        'Green Valley, Phase 2',
        'Bangalore',
        'Karnataka',
        '560001',
        3,
        3,
        1800,
        '["Garden", "Parking", "Security", "Swimming Pool", "Gym", "Club House"]',
        '["https://placehold.co/800x600/059669/ffffff?text=Premium+Villa"]',
        'active',
        NOW(),
        NOW()
      )
    `);
    
    // Get the new property ID
    const [newProperty] = await sequelize.query(`
      SELECT id, title, location, city, price 
      FROM listings 
      WHERE title = 'Premium Test Villa' 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    const propertyId = newProperty[0].id;
    console.log(`✅ Created new property: ${newProperty[0].title} (ID: ${propertyId})`);
    console.log(`   Location: ${newProperty[0].location}, ${newProperty[0].city}`);
    console.log(`   Rent: ₹${newProperty[0].price.toLocaleString()}/month`);
    
    // 3. Create rental for sekharravi406@gmail.com with this new property
    console.log('\n👤 Creating rental for sekharravi406@gmail.com...');
    
    // Calculate dates - rental started 15 days ago, so payment due in 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const startDate = fifteenDaysAgo.toISOString().split('T')[0];
    
    const paidUntilDate = new Date(fifteenDaysAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid for 1 month
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    console.log(`📅 Rental dates:`);
    console.log(`- Start Date: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Payment Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
    // Create rental
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
        1, ${propertyId}, '${startDate}', 18000.00, 54000.00,
        36000.00, 18000.00, 54000.00,
        '${nextPaymentDue.toISOString().split('T')[0]}', '${startDate}', 'current',
        '${paidUntilDate.toISOString().split('T')[0]}', ${fifteenDaysAgo.getDate()}, 0,
        'active', 'paid', 'order_villa_test', 'pay_villa_test',
        'test_signature', '9876543210', 'sekharravi406@gmail.com', 'New villa rental for testing',
        NOW(), NOW()
      )
    `);
    
    console.log('✅ Created rental for sekharravi406@gmail.com');
    
    // Update property status to rented
    await sequelize.query(`UPDATE listings SET status = 'rented' WHERE id = ${propertyId}`);
    console.log('✅ Updated property status to rented');
    
    // 4. Show final result
    const [sekharRentals] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.startDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyRent,
        r.paymentDayOfMonth,
        r.status,
        r.monthlyPaymentStatus,
        l.title as propertyTitle,
        l.location as propertyLocation,
        l.city as propertyCity,
        u.email as tenantEmail
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE u.email = 'sekharravi406@gmail.com'
      ORDER BY r.id
    `);
    
    console.log(`\n🎉 Sekhar's Rentals: ${sekharRentals.length}`);
    
    sekharRentals.forEach((rental, index) => {
      const today = new Date();
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. Rental ID: ${rental.rentalId}`);
      console.log(`   Property: ${rental.propertyTitle}`);
      console.log(`   Location: ${rental.propertyLocation}, ${rental.propertyCity}`);
      console.log(`   Monthly Rent: ₹${rental.monthlyRent.toLocaleString()}`);
      console.log(`   Start Date: ${rental.startDate}`);
      console.log(`   Paid Until: ${rental.paidUntilDate}`);
      console.log(`   Days Left: ${daysLeft} days`);
      console.log(`   Payment Day: ${rental.paymentDayOfMonth}th of every month`);
      console.log(`   Status: ${rental.status} (${rental.monthlyPaymentStatus})`);
      
      if (daysLeft > 0) {
        console.log(`   🟢 ACTIVE: ${daysLeft} days remaining`);
      } else if (daysLeft === 0) {
        console.log(`   🟡 DUE TODAY: Payment required`);
      } else {
        console.log(`   🔴 OVERDUE: ${Math.abs(daysLeft)} days overdue`);
      }
    });
    
    console.log('\n📋 Perfect Test Setup:');
    console.log('✅ New property (Premium Test Villa) - never rented before');
    console.log('✅ Only sekharravi406@gmail.com has rental on this property');
    console.log('✅ Good payment timeline for testing');
    console.log('✅ Higher rent amount (₹18,000) for variety');
    console.log('✅ Can test all rental features');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createNewRentalProperty();