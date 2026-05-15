const sequelize = require('../src/config/database');

async function addPurchaseDocumentFields() {
  try {
    console.log('Adding purchase document workflow fields to Purchase table...');
    
    // Add new columns to the Purchase table
    const columns = [
      { name: 'purchaseDocuments', type: 'JSON', default: null },
      { name: 'documentStatus', type: "ENUM('not_required', 'pending', 'submitted', 'verified', 'rejected')", default: "'not_required'" },
      { name: 'documentNotes', type: 'TEXT', default: 'NULL' },
      { name: 'documentSubmittedAt', type: 'DATETIME', default: 'NULL' },
      { name: 'documentVerifiedAt', type: 'DATETIME', default: 'NULL' }
    ];
    
    for (const column of columns) {
      try {
        const query = column.default === null 
          ? `ALTER TABLE purchases ADD COLUMN ${column.name} ${column.type};`
          : `ALTER TABLE purchases ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};`;
          
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
    
    // Update the status enum to include new values
    try {
      await sequelize.query(`
        ALTER TABLE purchases 
        MODIFY COLUMN status ENUM(
          'pending', 'admin_review', 'approved', 'documents_required', 
          'documents_submitted', 'documents_verified', 'confirmed', 
          'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'rejected'
        ) DEFAULT 'pending';
      `);
      console.log('✅ Updated status enum with new workflow values');
    } catch (error) {
      console.error('❌ Error updating status enum:', error.message);
    }
    
    console.log('✅ Purchase document workflow fields migration completed!');
    
  } catch (error) {
    console.error('❌ Error in migration:', error);
  } finally {
    await sequelize.close();
  }
}

addPurchaseDocumentFields();