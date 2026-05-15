const sequelize = require('../src/config/database');

async function createSimpleTestRental() {
  try {
    console.log('🏠 Creating simple test rental for sekharravi406@gmail.com...');
    
    // Calculate dates - rental started 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const startDate = oneMonthAgo.toISOString().split('T')[0];
    
    const paidUntilDate = new Date(oneMonthAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1);
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    
    console.log(`📅 Dates:`);
    console.log(`- Start: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
    // First, let's check if user exists
    const [users] = await sequelize.query(`
      SELECT id, name, email FROM users WHERE email = 'sekharravi406@gmail.com'
    `);
    
    let userId;
    if (users.length > 0) {
      userId = users[0].id;
      console.log(`✅ Found user: ${users[0].name} (ID: ${userId})`);
    } else {
      console.log('❌ User not found. Please create user first.');
      return;
    }
    
    // Delete any existing rentals for this user to avoid conflicts
    await sequelize.query(`DELETE FROM property_rentals WHERE userId = ${userId}`);
    console.log('🗑️ Cleaned up existing rentals');
    
    // Create rental using direct SQL with all required fields
    await sequelize.query(`
      INSERT INTO property_rentals (
        userId, listingId, startDate, endDate, monthlyRent, securityDeposit, totalAmount,
        advancePayment, firstMonthRent, initialPayment, nextPaymentDue, lastPaymentDate,
        monthlyPaymentStatus, paidUntilDate, paymentDayOfMonth, vacateRequested, vacateDate,
        vacateReason, status, paymentStatus, razorpayOrderId, razorpayPaymentId, razorpaySignature,
        tenantPhone, tenantEmail, notes, adminNotes, createdAt, updatedAt
      ) VALUES (
        ${userId}, 2, '${startDate}', NULL, 14000.00, NULL, 42000.00,
        28000.00, 14000.00, 42000.00, '${nextPaymentDue.toISOString().split('T')[0]}', '${startDate}',
        'due', '${paidUntilDate.toISOString().split('T')[0]}', ${oneMonthAgo.getDate()}, 0, NULL,
        NULL, 'active', 'paid', 'order_sekhar_test', 'pay_sekhar_test', 'test_signature',
        '9876543210', 'sekharravi406@gmail.com', 'Test rental - payment due today', NULL, NOW(), NOW()
      )
    `);
    
    console.log('✅ Created rental successfully');
    
    // Get the rental details
    const [rentals] = await sequelize.query(`
      SELECT 
        r.*,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.userId = ${userId}
      ORDER BY r.id DESC
      LIMIT 1
    `);
    
    if (rentals.length > 0) {
      const r = rentals[0];
      console.log('\n🎉 Test Rental Created Successfully!');
      console.log(`- Rental ID: ${r.id}`);
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- User: sekharravi406@gmail.com / 1234`);
      console.log(`- Start Date: ${r.startDate}`);
      console.log(`- Paid Until: ${r.paidUntilDate}`);
      console.log(`- Next Payment Due: ${r.nextPaymentDue}`);
      console.log(`- Payment Day: ${r.paymentDayOfMonth}th of every month`);
      console.log(`- Monthly Rent: ₹${r.monthlyRent.toLocaleString()}`);
      console.log(`- Status: ${r.status} (${r.monthlyPaymentStatus})`);
      
      const today = new Date();
      const paidUntil = new Date(r.paidUntilDate);
      const isPaymentDue = today >= paidUntil;
      
      console.log(`\n💰 Payment Status:`);
      console.log(`- Today: ${today.toISOString().split('T')[0]}`);
      console.log(`- Payment Due: ${isPaymentDue ? '🔴 YES - PAYMENT REQUIRED!' : '🟢 No'}`);
      
      console.log('\n📋 How to test:');
      console.log('1. Login: sekharravi406@gmail.com / 1234');
      console.log('2. Go to Dashboard → My Rental Properties');
      console.log('3. See "Pay Monthly Rent" button (₹14,000)');
      console.log('4. Test "Vacate Property" button');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSimpleTestRental();