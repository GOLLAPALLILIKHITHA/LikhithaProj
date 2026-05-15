const sequelize = require('../src/config/database');

async function updatePrepaidRental() {
  try {
    console.log('🔄 Updating rental system for prepaid model...');

    // Add prepaid rental columns
    const prepaidColumns = [
      { name: 'paidUntilDate', definition: 'DATE NULL COMMENT "Date until which rent is paid (prepaid system)"' },
      { name: 'paymentDayOfMonth', definition: 'INT NULL COMMENT "Day of month when rent is due (e.g., 4 for 4th of every month)"' }
    ];

    for (const column of prepaidColumns) {
      try {
        await sequelize.query(`ALTER TABLE property_rentals ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.original?.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column ${column.name} already exists, skipping...`);
        } else {
          console.log(`⚠️  Warning for ${column.name}: ${error.message}`);
        }
      }
    }

    // Remove old columns that are no longer needed
    const oldColumns = ['currentMonth', 'finalPaymentAmount', 'finalPaymentStatus'];
    for (const column of oldColumns) {
      try {
        await sequelize.query(`ALTER TABLE property_rentals DROP COLUMN ${column}`);
        console.log(`✅ Removed column: ${column}`);
      } catch (error) {
        if (error.original?.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`⚠️  Column ${column} doesn't exist, skipping...`);
        } else {
          console.log(`⚠️  Warning for ${column}: ${error.message}`);
        }
      }
    }

    // Update existing rentals with prepaid data
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        paidUntilDate = DATE_ADD(startDate, INTERVAL 1 MONTH),
        paymentDayOfMonth = DAY(startDate),
        nextPaymentDue = DATE_ADD(startDate, INTERVAL 1 MONTH)
      WHERE paidUntilDate IS NULL AND status = 'active'
    `);

    console.log('✅ Updated existing rentals with prepaid structure');

    // Show current rental data
    const [rentals] = await sequelize.query(`
      SELECT 
        id,
        startDate,
        paidUntilDate,
        nextPaymentDue,
        paymentDayOfMonth,
        status,
        vacateRequested
      FROM property_rentals 
      WHERE status = 'active'
      LIMIT 5
    `);

    if (rentals.length > 0) {
      console.log('\n📊 Sample Active Rentals:');
      rentals.forEach((rental, index) => {
        console.log(`\n${index + 1}. Rental ID: ${rental.id}`);
        console.log(`   Start Date: ${rental.startDate}`);
        console.log(`   Paid Until: ${rental.paidUntilDate}`);
        console.log(`   Next Due: ${rental.nextPaymentDue}`);
        console.log(`   Payment Day: ${rental.paymentDayOfMonth}th of month`);
        console.log(`   Status: ${rental.status}`);
        console.log(`   Vacate Requested: ${rental.vacateRequested ? 'Yes' : 'No'}`);
      });
    }

    console.log('\n🎉 Prepaid rental system updated successfully!');
    console.log('\n📋 How it works now:');
    console.log('   ✅ Rent paid in advance (prepaid like mobile plan)');
    console.log('   ✅ Same date every month (e.g., 4th of every month)');
    console.log('   ✅ Vacate anytime within paid period (no extra payment)');
    console.log('   ✅ No refunds for early vacate (already used the service)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prepaid rental system:', error);
    process.exit(1);
  }
}

updatePrepaidRental();