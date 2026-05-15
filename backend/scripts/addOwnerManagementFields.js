const sequelize = require('../src/config/database');

async function addOwnerManagementFields() {
  try {
    console.log('Adding owner management fields to Listing table...');
    
    // Add new columns to the Listing table one by one
    const columns = [
      { name: 'ownerDocuments', type: 'JSON', default: null },
      { name: 'thalukaDocuments', type: 'JSON', default: null },
      { name: 'agreementDocument', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'commissionPercentage', type: 'DECIMAL(5,2)', default: '10.00' },
      { name: 'ownerBankDetails', type: 'JSON', default: null },
      { name: 'ownerAadhaar', type: 'VARCHAR(12)', default: 'NULL' },
      { name: 'ownerPan', type: 'VARCHAR(10)', default: 'NULL' }
    ];
    
    for (const column of columns) {
      try {
        const query = column.default === null 
          ? `ALTER TABLE Listings ADD COLUMN ${column.name} ${column.type};`
          : `ALTER TABLE Listings ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};`;
          
        await sequelize.query(query);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      }
    }
    
    console.log('✅ Owner management fields migration completed!');
    
    // Update existing listings with default commission percentage
    await sequelize.query(`
      UPDATE Listings 
      SET commissionPercentage = 10.00 
      WHERE commissionPercentage IS NULL OR commissionPercentage = 0;
    `);
    
    console.log('✅ Default commission percentages set for existing listings!');
    
  } catch (error) {
    console.error('❌ Error in migration:', error);
  } finally {
    await sequelize.close();
  }
}

addOwnerManagementFields();