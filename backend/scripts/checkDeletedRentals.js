const sequelize = require('../src/config/database');

async function checkDeletedRentals() {
  try {
    console.log('🔍 Checking what rentals we have now...');
    
    // Check current rentals
    const [currentRentals] = await sequelize.query(`
      SELECT 
        r.*,
        u.name as tenantName,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      ORDER BY r.id
    `);
    
    console.log(`\n📊 Current rentals: ${currentRentals.length}`);
    
    if (currentRentals.length > 0) {
      currentRentals.forEach((rental, index) => {
        console.log(`${index + 1}. ID: ${rental.id} - ${rental.tenantName} (${rental.tenantEmail})`);
        console.log(`   Property: ${rental.propertyTitle}`);
        console.log(`   Start: ${rental.startDate}, Paid Until: ${rental.paidUntilDate}`);
        console.log(`   Status: ${rental.status}`);
      });
    } else {
      console.log('❌ No rentals found!');
    }
    
    // Check users to see who we have
    const [users] = await sequelize.query(`
      SELECT id, name, email FROM users ORDER BY id
    `);
    
    console.log(`\n👥 Available users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} - ${user.name} (${user.email})`);
    });
    
    // Let me recreate the rental that was active until June for Likhotha
    console.log('\n🔄 Recreating Likhotha rental that was active until June...');
    
    // Find Likhotha's user ID
    const likhothaUser = users.find(u => u.email === 'gollapallilikki@gmail.com');
    
    if (likhothaUser) {
      console.log(`✅ Found Likhotha user: ID ${likhothaUser.id}`);
      
      // Create rental that started in May and is paid until June 4
      const startDate = '2026-05-04'; // Started May 4
      const paidUntilDate = '2026-06-04'; // Paid until June 4
      const nextPaymentDue = '2026-07-04'; // Next payment due July 4
      
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
          ${likhothaUser.id}, 2, '${startDate}', 14000.00, 42000.00,
          28000.00, 14000.00, 42000.00,
          '${nextPaymentDue}', '${startDate}', 'current',
          '${paidUntilDate}', 4, 0,
          'active', 'paid', 'order_likhotha_june', 'pay_likhotha_june',
          'test_signature', '9876543210', 'gollapallilikki@gmail.com', 'Restored rental - active until June',
          NOW(), NOW()
        )
      `);
      
      console.log('✅ Recreated Likhotha rental (active until June 4)');
      
      // Also create the sekharravi rental with different dates
      const sekharUser = users.find(u => u.email === 'sekharravi406@gmail.com');
      if (sekharUser) {
        console.log(`✅ Found Sekhar user: ID ${sekharUser.id}`);
        
        // Create rental that needs payment soon
        const sekharStart = '2026-04-04';
        const sekharPaidUntil = '2026-05-04'; // Due today
        const sekharNextDue = '2026-06-04';
        
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
            ${sekharUser.id}, 2, '${sekharStart}', 14000.00, 42000.00,
            28000.00, 14000.00, 42000.00,
            '${sekharNextDue}', '${sekharStart}', 'due',
            '${sekharPaidUntil}', 4, 0,
            'active', 'paid', 'order_sekhar_due', 'pay_sekhar_due',
            'test_signature', '9876543210', 'sekharravi406@gmail.com', 'Test rental - payment due',
            NOW(), NOW()
          )
        `);
        
        console.log('✅ Created Sekhar rental (payment due today)');
      }
    }
    
    // Show final result
    const [finalRentals] = await sequelize.query(`
      SELECT 
        r.*,
        u.name as tenantName,
        u.email as tenantEmail,
        l.title as propertyTitle
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      ORDER BY r.id
    `);
    
    console.log(`\n🎉 Final rentals: ${finalRentals.length}`);
    
    finalRentals.forEach((rental, index) => {
      const today = new Date();
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`\n${index + 1}. ${rental.tenantName} (${rental.tenantEmail})`);
      console.log(`   Property: ${rental.propertyTitle}`);
      console.log(`   Paid Until: ${rental.paidUntilDate}`);
      console.log(`   Days Left: ${daysLeft} days`);
      console.log(`   Status: ${rental.status} (${rental.monthlyPaymentStatus})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDeletedRentals();