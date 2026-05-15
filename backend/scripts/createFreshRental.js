const sequelize = require('../src/config/database');

async function createFreshRental() {
  try {
    console.log('🧹 Creating fresh rental setup...');
    
    // 1. Clean up all existing rentals
    console.log('\n🗑️ Cleaning up existing rentals...');
    await sequelize.query('DELETE FROM monthly_payments');
    await sequelize.query('DELETE FROM property_rentals');
    await sequelize.query("UPDATE listings SET status = 'active' WHERE category = 'property_rent'");
    console.log('✅ Cleanup completed');
    
    // 2. Create new rental property
    console.log('\n🏗️ Creating new rental property...');
    
    // First create the property
    await sequelize.query(`
      INSERT INTO listings (
        userId, title, description, category, subcategory, price, location, city, state, 
        pincode, bedrooms, bathrooms, area, amenities, images, status, 
        createdAt, updatedAt
      ) VALUES (
        1,
        'Modern Test Apartment',
        'Beautiful 2BHK apartment perfect for testing rental system. Fully furnished with modern amenities.',
        'property_rent',
        'apartment',
        15000.00,
        'Test Colony, Sector 5',
        'Test City',
        'Test State',
        '123456',
        2,
        2,
        1200,
        '["Parking", "Security", "Lift", "Power Backup", "Water Supply"]',
        '["https://placehold.co/800x600/1e1b4b/818cf8?text=Test+Apartment"]',
        'active',
        NOW(),
        NOW()
      )
    `);
    
    // Get the new property ID
    const [newProperty] = await sequelize.query(`
      SELECT id FROM listings 
      WHERE title = 'Modern Test Apartment' 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    const propertyId = newProperty[0].id;
    console.log(`✅ Created property with ID: ${propertyId}`);
    
    // 3. Create rental for sekharravi406@gmail.com
    console.log('\n👤 Creating rental for sekharravi406@gmail.com...');
    
    // Calculate dates - rental started 20 days ago
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const startDate = twentyDaysAgo.toISOString().split('T')[0];
    
    const paidUntilDate = new Date(twentyDaysAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1);
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    console.log(`📅 Rental dates:`);
    console.log(`- Start: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
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
        1, ${propertyId}, '${startDate}', 15000.00, 45000.00,
        30000.00, 15000.00, 45000.00,
        '${nextPaymentDue.toISOString().split('T')[0]}', '${startDate}', 'current',
        '${paidUntilDate.toISOString().split('T')[0]}', ${twentyDaysAgo.getDate()}, 0,
        'active', 'paid', 'order_fresh_test', 'pay_fresh_test',
        'test_signature', '9876543210', 'sekharravi406@gmail.com', 'Fresh test rental',
        NOW(), NOW()
      )
    `);
    
    console.log('✅ Created rental');
    
    // Update property status
    await sequelize.query(`UPDATE listings SET status = 'rented' WHERE id = ${propertyId}`);
    
    // 4. Show final result
    const [result] = await sequelize.query(`
      SELECT 
        r.id as rentalId,
        r.startDate,
        r.paidUntilDate,
        r.nextPaymentDue,
        r.monthlyRent,
        r.paymentDayOfMonth,
        r.status,
        l.title as propertyTitle,
        l.location as propertyLocation,
        u.email as tenantEmail
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.userId = 1
    `);
    
    if (result.length > 0) {
      const r = result[0];
      const today = new Date();
      const paidUntil = new Date(r.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('\n🎉 Fresh Test Rental Created!');
      console.log(`- Rental ID: ${r.rentalId}`);
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Location: ${r.propertyLocation}`);
      console.log(`- Tenant: ${r.tenantEmail} / password: 1234`);
      console.log(`- Monthly Rent: ₹${r.monthlyRent.toLocaleString()}`);
      console.log(`- Start Date: ${r.startDate}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Days Left: ${daysLeft} days`);
      console.log(`- Payment Day: ${r.paymentDayOfMonth}th of every month`);
      console.log(`- Status: ${r.status}`);
      
      console.log('\n📋 Test Scenario:');
      if (daysLeft > 0) {
        console.log(`✅ Payment due in ${daysLeft} days - perfect for testing!`);
        console.log('✅ User will see "Active until [date]" message');
        console.log('✅ Can test advance payment option');
      } else {
        console.log('✅ Payment due - perfect for testing payment flow!');
      }
      console.log('✅ Clean database with single rental');
      console.log('✅ New property (never rented before)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFreshRental();