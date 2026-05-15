const sequelize = require('../src/config/database');

async function cleanSlateRental() {
  try {
    console.log('🧹 Complete cleanup and fresh start...');
    
    // 1. Remove ALL existing rentals
    console.log('\n🗑️ Step 1: Removing all existing rentals...');
    await sequelize.query('DELETE FROM monthly_payments');
    await sequelize.query('DELETE FROM property_rentals');
    console.log('✅ All rentals and payments deleted');
    
    // 2. Reset all property statuses to 'active' (available for rent)
    console.log('\n🔄 Step 2: Making all properties available again...');
    await sequelize.query("UPDATE listings SET status = 'active' WHERE category = 'property_rent'");
    console.log('✅ All rental properties are now available');
    
    // 3. Check available rental properties
    const [properties] = await sequelize.query(`
      SELECT id, title, location, city, price, status 
      FROM listings 
      WHERE category = 'property_rent' 
      ORDER BY id
    `);
    
    console.log('\n🏠 Available rental properties:');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ID: ${prop.id} - ${prop.title} - ${prop.location}, ${prop.city} - ₹${prop.price.toLocaleString()}/month - Status: ${prop.status}`);
    });
    
    // 4. Create a NEW rental property for testing
    console.log('\n🏗️ Step 3: Creating new test rental property...');
    
    const [newProperty] = await sequelize.query(`
      INSERT INTO listings (
        userId, title, description, category, subcategory, price, location, city, state, 
        pincode, bedrooms, bathrooms, area, amenities, images, status, 
        createdAt, updatedAt
      ) VALUES (
        1, -- Owner user ID
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
    
    const newPropertyId = newProperty.insertId;
    console.log(`✅ Created new test property with ID: ${newPropertyId}`);
    
    // 5. Create rental for sekharravi406@gmail.com with the new property
    console.log('\n👤 Step 4: Creating rental for sekharravi406@gmail.com...');
    
    // Calculate dates - rental started 20 days ago, so payment is due in 10 days
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    const startDate = twentyDaysAgo.toISOString().split('T')[0];
    
    const paidUntilDate = new Date(twentyDaysAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid for 1 month
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    console.log(`📅 Rental dates:`);
    console.log(`- Start Date: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Payment Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
    // Create the rental
    await sequelize.query(`
      INSERT INTO property_rentals (
        userId, listingId, startDate, endDate, monthlyRent, securityDeposit, totalAmount,
        advancePayment, firstMonthRent, initialPayment, nextPaymentDue, lastPaymentDate,
        monthlyPaymentStatus, paidUntilDate, paymentDayOfMonth, vacateRequested, vacateDate,
        vacateReason, status, paymentStatus, razorpayOrderId, razorpayPaymentId, razorpaySignature,
        tenantPhone, tenantEmail, notes, adminNotes, createdAt, updatedAt
      ) VALUES (
        1, ${newPropertyId}, '${startDate}', NULL, 15000.00, NULL, 45000.00,
        30000.00, 15000.00, 45000.00, '${nextPaymentDue.toISOString().split('T')[0]}', '${startDate}',
        'current', '${paidUntilDate.toISOString().split('T')[0]}', ${twentyDaysAgo.getDate()}, 0, NULL,
        NULL, 'active', 'paid', 'order_test_new_property', 'pay_test_new_property', 'test_signature',
        '9876543210', 'sekharravi406@gmail.com', 'Test rental with new property', NULL, NOW(), NOW()
      )
    `);
    
    console.log('✅ Created rental for sekharravi406@gmail.com');
    
    // 6. Update property status to rented
    await sequelize.query(`UPDATE listings SET status = 'rented' WHERE id = ${newPropertyId}`);
    console.log('✅ Updated property status to rented');
    
    // 7. Show final result
    const [finalRental] = await sequelize.query(`
      SELECT 
        r.*,
        l.title as propertyTitle,
        l.location as propertyLocation,
        u.email as tenantEmail
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.userId = 1
    `);
    
    if (finalRental.length > 0) {
      const r = finalRental[0];
      const today = new Date();
      const paidUntil = new Date(r.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('\n🎉 Fresh Test Rental Created Successfully!');
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Location: ${r.propertyLocation}`);
      console.log(`- Tenant: ${r.tenantEmail} / password: 1234`);
      console.log(`- Monthly Rent: ₹${r.monthlyRent.toLocaleString()}`);
      console.log(`- Start Date: ${r.startDate}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Days Left: ${daysLeft} days`);
      console.log(`- Payment Day: ${r.paymentDayOfMonth}th of every month`);
      console.log(`- Status: ${r.status} (${r.monthlyPaymentStatus})`);
      
      console.log('\n📋 Perfect for testing:');
      console.log('✅ Clean database with only one rental');
      console.log('✅ New property (not previously rented)');
      console.log('✅ Payment due in 10+ days (good for testing)');
      console.log('✅ Can test monthly payment and vacate features');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanSlateRental();