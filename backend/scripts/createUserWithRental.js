const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function createUserWithRental() {
  try {
    console.log('👤 Creating user and rental scenario...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('1234', 10);
    
    // Create or update user
    let userId;
    try {
      const [result] = await sequelize.query(`
        INSERT INTO users (name, email, password, phone, role, isVerified, createdAt, updatedAt)
        VALUES ('Sekhar Ravi', 'sekharravi406@gmail.com', ?, '9876543210', 'user', true, NOW(), NOW())
      `, {
        replacements: [hashedPassword]
      });
      userId = result.insertId;
      console.log('✅ Created new user with ID:', userId);
    } catch (error) {
      if (error.original?.code === 'ER_DUP_ENTRY') {
        // User already exists, get their ID
        const [users] = await sequelize.query(`
          SELECT id FROM users WHERE email = 'sekharravi406@gmail.com'
        `);
        userId = users[0].id;
        console.log('✅ User already exists with ID:', userId);
      } else {
        throw error;
      }
    }
    
    // Create verified KYC for this user
    try {
      await sequelize.query(`
        INSERT INTO kyc (userId, fullName, dateOfBirth, address, documentType, documentNumber, documentUrl, status, createdAt, updatedAt)
        VALUES (?, 'Sekhar Ravi', '1990-01-01', 'Test Address, City', 'aadhar', '123456789012', 'test-document.pdf', 'verified', NOW(), NOW())
        ON DUPLICATE KEY UPDATE status = 'verified'
      `, {
        replacements: [userId]
      });
      console.log('✅ Created/updated KYC verification');
    } catch (kycError) {
      console.log('⚠️ KYC table might not exist, skipping...');
    }
    
    // Create a rental that started 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const startDate = oneMonthAgo.toISOString().split('T')[0];
    
    // Calculate dates for prepaid system
    const paidUntilDate = new Date(oneMonthAgo);
    paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid until today
    
    const nextPaymentDue = new Date(paidUntilDate);
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1); // Next payment due next month
    
    console.log(`📅 Rental dates:`);
    console.log(`- Start Date: ${startDate}`);
    console.log(`- Paid Until: ${paidUntilDate.toISOString().split('T')[0]}`);
    console.log(`- Next Payment Due: ${nextPaymentDue.toISOString().split('T')[0]}`);
    
    // Insert rental record
    const [rentalResult] = await sequelize.query(`
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
        ${userId}, 
        2, 
        '${startDate}', 
        14000, 
        28000, 
        14000, 
        42000, 
        42000,
        '${paidUntilDate.toISOString().split('T')[0]}', 
        '${nextPaymentDue.toISOString().split('T')[0]}', 
        ${oneMonthAgo.getDate()}, 
        '${startDate}', 
        'due', 
        'active', 
        'paid', 
        'order_sekhar_test', 
        'pay_sekhar_test', 
        'test_signature',
        false,
        NOW(), 
        NOW()
      )
    `);
    
    const rentalId = rentalResult.insertId;
    console.log(`✅ Created rental with ID: ${rentalId}`);
    
    // Create first month payment record (already paid)
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
        ${rentalId},
        ${userId},
        1,
        '${oneMonthAgo.getFullYear()}-${String(oneMonthAgo.getMonth() + 1).padStart(2, '0')}',
        14000,
        '${startDate}',
        '${startDate}',
        'paid',
        14000,
        'Paid with initial payment - Month 1',
        NOW(),
        NOW()
      )
    `);
    
    console.log('✅ Created first month payment record');
    
    // Show final details
    const [rental] = await sequelize.query(`
      SELECT 
        r.*,
        l.title as propertyTitle,
        u.name as tenantName,
        u.email as tenantEmail
      FROM property_rentals r
      LEFT JOIN listings l ON r.listingId = l.id
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.id = ${rentalId}
    `);
    
    if (rental.length > 0) {
      const r = rental[0];
      console.log('\n🏠 Test Scenario Created Successfully!');
      console.log(`- Property: ${r.propertyTitle}`);
      console.log(`- Tenant: ${r.tenantName} (${r.tenantEmail})`);
      console.log(`- Password: 1234`);
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
      console.log(`- Payment Due: ${isPaymentDue ? '🔴 YES - MONTHLY PAYMENT REQUIRED!' : '🟢 No, still within paid period'}`);
    }
    
    console.log('\n🎉 Complete test scenario created!');
    console.log('\n📋 How to test:');
    console.log('1. Login with: sekharravi406@gmail.com / 1234');
    console.log('2. Go to User Dashboard → My Rental Properties');
    console.log('3. You should see "Pay Monthly Rent" button');
    console.log('4. Click to pay ₹14,000 for next month');
    console.log('5. Also test "Vacate Property" button');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user and rental:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createUserWithRental();