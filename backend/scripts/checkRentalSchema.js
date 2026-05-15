const sequelize = require('../src/config/database');

async function checkRentalSchema() {
  try {
    console.log('🔍 Checking property_rentals table structure...');
    
    const [results] = await sequelize.query('DESCRIBE property_rentals');
    
    console.log('\n📋 Property Rentals Table Structure:');
    results.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Check if we have the required columns
    const columnNames = results.map(col => col.Field);
    const requiredColumns = ['paidUntilDate', 'paymentDayOfMonth'];
    
    console.log('\n✅ Required Columns Check:');
    requiredColumns.forEach(col => {
      const exists = columnNames.includes(col);
      console.log(`- ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    process.exit(1);
  }
}

checkRentalSchema();