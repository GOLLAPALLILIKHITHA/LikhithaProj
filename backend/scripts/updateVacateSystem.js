const sequelize = require('../src/config/database');

async function updateVacateSystem() {
  try {
    console.log('🔄 Updating rental system for flexible vacate...');

    // Add vacate system columns one by one
    const vacateColumns = [
      { name: 'vacateRequested', definition: 'BOOLEAN DEFAULT FALSE COMMENT "Whether tenant has requested to vacate"' },
      { name: 'vacateDate', definition: 'DATE NULL COMMENT "Date when tenant will vacate"' },
      { name: 'vacateReason', definition: 'TEXT NULL COMMENT "Reason for vacating (optional)"' },
      { name: 'finalPaymentAmount', definition: 'DECIMAL(15,2) NULL COMMENT "Final month payment amount"' },
      { name: 'finalPaymentStatus', definition: 'ENUM("pending", "paid") NULL COMMENT "Status of final payment before vacating"' }
    ];

    for (const column of vacateColumns) {
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

    // Remove old duration columns one by one
    const oldColumns = ['duration', 'durationType', 'totalMonths', 'totalContractValue'];
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

    // Make endDate nullable
    try {
      await sequelize.query(`ALTER TABLE property_rentals MODIFY COLUMN endDate DATE NULL COMMENT 'End date (set when tenant vacates)'`);
      console.log('✅ Made endDate nullable');
    } catch (error) {
      console.log(`⚠️  Warning: ${error.message}`);
    }

    // Update existing rentals to remove end dates (make them month-to-month)
    await sequelize.query(`
      UPDATE property_rentals 
      SET endDate = NULL 
      WHERE status = 'active' AND endDate IS NOT NULL
    `);

    console.log('✅ Updated existing active rentals to month-to-month');

    // Show current rental statistics
    const [rentalStats] = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(monthlyRent) as avg_rent
      FROM property_rentals 
      GROUP BY status
      ORDER BY status
    `);

    console.log('\n📊 Updated Rental Statistics:');
    rentalStats.forEach(stat => {
      console.log(`   Status: ${stat.status} | Count: ${stat.count} | Avg Rent: ₹${Math.round(stat.avg_rent || 0)}`);
    });

    console.log('\n🎉 Flexible vacate system updated successfully!');
    console.log('\n📋 New Features:');
    console.log('   ✅ Month-to-month rentals (no fixed duration)');
    console.log('   ✅ Flexible vacate - pay current month and leave');
    console.log('   ✅ Simple vacate process like scheduling a visit');
    console.log('   ✅ Immediate property availability after vacate payment');
    console.log('   ✅ Professional rental management');

    console.log('\n💡 How it works:');
    console.log('   1. Tenant clicks "Vacate Property"');
    console.log('   2. Selects vacate date and reason');
    console.log('   3. Pays current month rent');
    console.log('   4. Property becomes available immediately');
    console.log('   5. Admin gets notification for new tenant search');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating vacate system:', error);
    process.exit(1);
  }
}

updateVacateSystem();