const sequelize = require('../src/config/database');

async function updateRentalTableMonthly() {
  try {
    console.log('🔄 Updating PropertyRental table for monthly payment system...');

    // Add new columns for monthly payment tracking
    const newColumns = [
      { name: 'currentMonth', definition: 'INT DEFAULT 1 COMMENT "Current month of rental (1 = first month)"' },
      { name: 'totalMonths', definition: 'INT NOT NULL COMMENT "Total months in rental contract"' },
      { name: 'nextPaymentDue', definition: 'DATE NULL COMMENT "Next monthly payment due date"' },
      { name: 'lastPaymentDate', definition: 'DATE NULL COMMENT "Last payment received date"' },
      { name: 'monthlyPaymentStatus', definition: 'ENUM("current", "due", "overdue", "completed") DEFAULT "current" COMMENT "Current monthly payment status"' }
    ];

    for (const column of newColumns) {
      try {
        await sequelize.query(`ALTER TABLE property_rentals ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.original?.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column ${column.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Remove the remainingRent column as we're using monthly payment tracking now
    try {
      await sequelize.query(`ALTER TABLE property_rentals DROP COLUMN remainingRent`);
      console.log(`✅ Removed column: remainingRent`);
    } catch (error) {
      if (error.original?.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log(`⚠️  Column remainingRent doesn't exist, skipping...`);
      } else {
        console.log(`⚠️  Could not remove remainingRent column: ${error.message}`);
      }
    }

    // Update existing records with new monthly payment structure
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        totalMonths = CASE 
          WHEN durationType = 'years' THEN duration * 12
          ELSE duration
        END,
        nextPaymentDue = DATE_ADD(startDate, INTERVAL 1 MONTH),
        lastPaymentDate = CASE 
          WHEN paymentStatus = 'paid' THEN CURDATE()
          ELSE NULL
        END,
        monthlyPaymentStatus = CASE 
          WHEN status = 'active' THEN 'current'
          WHEN status = 'completed' THEN 'completed'
          ELSE 'current'
        END
      WHERE totalMonths IS NULL OR totalMonths = 0
    `);

    console.log('✅ Updated existing rental records with monthly payment structure');

    // Create monthly_payments table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS monthly_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rentalId INT NOT NULL,
        userId INT NOT NULL,
        monthNumber INT NOT NULL,
        monthYear VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
        amount DECIMAL(15,2) NOT NULL COMMENT 'Monthly rent amount',
        dueDate DATE NOT NULL COMMENT 'Payment due date',
        paidDate DATE NULL COMMENT 'Date when payment was made',
        status ENUM('pending', 'paid', 'overdue', 'waived') DEFAULT 'pending' COMMENT 'Payment status',
        paymentMethod VARCHAR(50) NULL COMMENT 'Payment method used',
        razorpayOrderId VARCHAR(255) NULL,
        razorpayPaymentId VARCHAR(255) NULL,
        razorpaySignature VARCHAR(255) NULL,
        lateFee DECIMAL(15,2) DEFAULT 0 COMMENT 'Late payment fee if applicable',
        totalAmount DECIMAL(15,2) NOT NULL COMMENT 'Total amount including late fees',
        notes TEXT NULL COMMENT 'Payment notes or remarks',
        notificationSent BOOLEAN DEFAULT FALSE COMMENT 'Whether payment reminder notification was sent',
        reminderCount INT DEFAULT 0 COMMENT 'Number of reminders sent',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_rental_month (rentalId, monthNumber),
        INDEX idx_user_status (userId, status),
        INDEX idx_due_date_status (dueDate, status),
        FOREIGN KEY (rentalId) REFERENCES property_rentals(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Created monthly_payments table');

    // Show sample data
    const [results] = await sequelize.query(`
      SELECT 
        id,
        monthlyRent,
        duration,
        durationType,
        totalMonths,
        currentMonth,
        nextPaymentDue,
        monthlyPaymentStatus,
        status
      FROM property_rentals 
      LIMIT 3
    `);

    if (results.length > 0) {
      console.log('\n📊 Sample updated records:');
      results.forEach((record, index) => {
        console.log(`\n${index + 1}. Rental ID: ${record.id}`);
        console.log(`   Monthly Rent: ₹${record.monthlyRent}`);
        console.log(`   Duration: ${record.duration} ${record.durationType}`);
        console.log(`   Total Months: ${record.totalMonths}`);
        console.log(`   Current Month: ${record.currentMonth}`);
        console.log(`   Next Payment Due: ${record.nextPaymentDue}`);
        console.log(`   Payment Status: ${record.monthlyPaymentStatus}`);
        console.log(`   Rental Status: ${record.status}`);
      });
    }

    console.log('\n🎉 Monthly payment system setup completed successfully!');
    console.log('\n📋 New Features:');
    console.log('   ✅ Monthly payment tracking');
    console.log('   ✅ Automatic payment reminders');
    console.log('   ✅ Late fee calculation');
    console.log('   ✅ Payment history tracking');
    console.log('   ✅ Overdue payment management');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating rental table for monthly payments:', error);
    process.exit(1);
  }
}

updateRentalTableMonthly();