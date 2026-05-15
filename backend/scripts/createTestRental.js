const sequelize = require('../src/config/database');

async function createTestRental() {
  try {
    console.log('🏠 Creating test rental scenario...');
    
    // Create a rental that started 1 month ago (April 4, 2026)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const startDate = oneMonthAgo.toISOString().split('T')[0];
    
    // Calculate dates
    const paidUntilDate = new Date(oneMonthAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid until today
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1); // Next payment due next month
    
    console.log(`📅 Rental dates:`);
    console.log(`- Start Date: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Payment Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
    // Insert test rental
    const [result] = await sequelize.query(`
      INSERT INTO property_rentals (
        userId, 
        listingId, 
        startDate, 
        monthlyRent, 
        advancePayment, 
        firstMonthRent, 
        initialPayment, 
        totalAmount,
        paidUntilDate, 
        nextPaymentDue, 
        paymentDayOfMonth, 
        lastPaymentDate, 
        monthlyPaymentStatus, 
        status, 
        paymentStatus, 
        razorpayOrderId, 
        razorpayPaymentId, 
        razorpaySignature,
        vacateRequested,
        createdAt, 
        updatedAt
      ) VALUES (
        3, -- User ID (assuming user 3 exists)
        2, -- Listing ID (Siva House)
        ?, -- startDate
        14000, -- monthlyRent
        28000, -- advancePayment (2 months)
        14000, -- firstMonthRent
        42000, -- initialPayment (total upfront)
        42000, -- totalAmount
        ?, -- paidUntilDate
        ?, -- nextPaymentDue
        ?, -- paymentDayOfMonth
        ?, -- lastPaymentDate
        'due', -- monthlyPaymentStatus (payment is due!)
        'active', -- status
        'paid', -- paymentStatus (initial payment was paid)
        'order_test_monthly_due', -- razorpayOrderId
        'pay_test_monthly_due', -- razorpayPaymentId
        'test_signature', -- razorpaySignature
        false, -- vacateRequested
        NOW(), -- createdAt
        NOW() -- updatedAt
      )
    `, {
      replacements: [
        startDate,
        paidUntilDate.toISOString().split('T')[0],
        nextPaymentDue.toISOString().split('T')[0],
        oneMonthAgo.getDate(), // paymentDayOfMonth
        startDate // lastPaymentDate (when they paid initially)
      ]
    });
    
    const rentalId = result.insertId;
    console.log(`✅ Created test rental with ID: ${rentalId}`);
    
    // Create the first month payment record (already paid)
    await sequelize.query(`
      INSERT INTO monthly_payments (
        rentalId,
        userId,
        monthNumber,
        monthYear,
        amount,
        dueDate,
        paidDate,
        status,
        totalAmount,
        notes,
        createdAt,
        updatedAt
      ) VALUES (
        ?, -- rentalId
        3, -- userId
        1, -- monthNumber
        ?, -- monthYear
        14000, -- amount
        ?, -- dueDate
        ?, -- paidDate
        'paid', -- status
        14000, -- totalAmount
        'Paid with initial payment - Month 1',
        NOW(),
        NOW()
      )
    `, {
      replacements: [
        rentalId,
        `${oneMonthAgo.getFullYear()}-${String(oneMonthAgo.getMonth() + 1).padStart(2, '0')}`,
        startDate,
        startDate
      ]
    });
    
    console.log('✅ Created first month payment record');
    
    // Show the rental details
    const [rental] = await sequelize.query(`
      SELECT 
        r.*,
        l.title as propertyTitle,
        u.name as tenantName
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.id = ?
    `, {
      replacements: [rentalId]
    });
    
    if (rental.length > 0) {
      const r = rental[0];
      console.log('\n🏠 Test Rental Created:');
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Tenant: ${r.tenantName}`);
      console.log(`- Start Date: ${r.startDate}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Next Payment Due: ${r.nextPaymentDue}`);
      console.log(`- Payment Day: ${r.paymentDayOfMonth}th of every month`);
      console.log(`- Monthly Rent: ₹${r.monthlyRent.toLocaleString()}`);
      console.log(`- Status: ${r.status}`);
      console.log(`- Payment Status: ${r.monthlyPaymentStatus}`);
      
      const today = new Date();
      const paidUntil = new Date(r.paidUntilDate);
      const isPaymentDue = today >= paidUntil;
      
      console.log(`\n💰 Payment Status:`);
      console.log(`- Today: ${today.toISOString().split('T')[0]}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Payment Due: ${isPaymentDue ? '🔴 YES - PAYMENT REQUIRED!' : '🟢 No, still within paid period'}`);
    }
    
    console.log('\n🎉 Test rental scenario created successfully!');
    console.log('\n📋 What this means:');
    console.log('✅ Tenant rented property 1 month ago');
    console.log('✅ Paid ₹42,000 upfront (2 months advance + 1st month)');
    console.log('✅ First month is over, now they need to pay monthly rent');
    console.log('✅ "Pay Monthly Rent" button should appear in user dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test rental:', error.message);
    process.exit(1);
  }
}

createTestRental();