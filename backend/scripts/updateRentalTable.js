const sequelize = require('../src/config/database');

async function updateRentalTable() {
  try {
    console.log('🔄 Updating PropertyRental table with new payment structure...');

    // Check if columns exist and add them one by one
    const columns = [
      { name: 'advancePayment', definition: 'DECIMAL(15,2) DEFAULT 0 COMMENT "2 months advance payment"' },
      { name: 'firstMonthRent', definition: 'DECIMAL(15,2) DEFAULT 0 COMMENT "First month rent"' },
      { name: 'initialPayment', definition: 'DECIMAL(15,2) DEFAULT 0 COMMENT "Total upfront payment (advance + first month)"' },
      { name: 'remainingRent', definition: 'DECIMAL(15,2) DEFAULT 0 COMMENT "Remaining rent to be paid"' },
      { name: 'totalContractValue', definition: 'DECIMAL(15,2) DEFAULT 0 COMMENT "Total contract value for entire duration"' }
    ];

    for (const column of columns) {
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

    // Update existing records to populate new fields based on existing data
    await sequelize.query(`
      UPDATE property_rentals 
      SET 
        advancePayment = monthlyRent * 2,
        firstMonthRent = monthlyRent,
        initialPayment = monthlyRent * 3,
        remainingRent = CASE 
          WHEN durationType = 'years' THEN monthlyRent * (duration * 12 - 1)
          ELSE monthlyRent * (duration - 1)
        END,
        totalContractValue = CASE 
          WHEN durationType = 'years' THEN monthlyRent * duration * 12
          ELSE monthlyRent * duration
        END
      WHERE advancePayment = 0 OR advancePayment IS NULL
    `);

    console.log('✅ PropertyRental table updated successfully!');
    console.log('📋 New payment structure:');
    console.log('   - advancePayment: 2 months advance');
    console.log('   - firstMonthRent: 1st month rent');
    console.log('   - initialPayment: Total upfront (advance + 1st month)');
    console.log('   - remainingRent: Remaining months to be paid');
    console.log('   - totalContractValue: Total contract value');

    // Show sample data
    const [results] = await sequelize.query(`
      SELECT 
        id,
        monthlyRent,
        duration,
        durationType,
        advancePayment,
        firstMonthRent,
        initialPayment,
        remainingRent,
        totalContractValue
      FROM property_rentals 
      LIMIT 3
    `);

    if (results.length > 0) {
      console.log('\n📊 Sample updated records:');
      results.forEach((record, index) => {
        console.log(`\n${index + 1}. Rental ID: ${record.id}`);
        console.log(`   Monthly Rent: ₹${record.monthlyRent}`);
        console.log(`   Duration: ${record.duration} ${record.durationType}`);
        console.log(`   Advance Payment: ₹${record.advancePayment}`);
        console.log(`   First Month Rent: ₹${record.firstMonthRent}`);
        console.log(`   Initial Payment: ₹${record.initialPayment}`);
        console.log(`   Remaining Rent: ₹${record.remainingRent}`);
        console.log(`   Total Contract: ₹${record.totalContractValue}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating PropertyRental table:', error);
    process.exit(1);
  }
}

updateRentalTable();