const sequelize = require('../src/config/database');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Starting database schema fix...');
    
    // Fix Purchase table - add missing columns
    console.log('\n📦 Fixing Purchase table...');
    const purchaseColumns = [
      { name: 'rentalType', type: "ENUM('buy', 'rent')", default: "'buy'" },
      { name: 'purpose', type: "ENUM('home', 'office', 'other')", default: 'NULL' },
      { name: 'rentalDuration', type: 'INT', default: 'NULL' },
      { name: 'registrationDate', type: 'DATE', default: 'NULL' },
      { name: 'possessionDate', type: 'DATE', default: 'NULL' },
      { name: 'purchaseDocuments', type: 'JSON', default: 'NULL' },
      { name: 'documentStatus', type: "ENUM('not_required', 'pending', 'submitted', 'verified', 'rejected')", default: "'not_required'" },
      { name: 'documentNotes', type: 'TEXT', default: 'NULL' },
      { name: 'documentSubmittedAt', type: 'DATETIME', default: 'NULL' },
      { name: 'documentVerifiedAt', type: 'DATETIME', default: 'NULL' },
      { name: 'trackingNumber', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'estimatedDelivery', type: 'DATE', default: 'NULL' }
    ];
    
    for (const column of purchaseColumns) {
      try {
        const query = column.default === 'NULL' 
          ? `ALTER TABLE purchases ADD COLUMN ${column.name} ${column.type};`
          : `ALTER TABLE purchases ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};`;
          
        await sequelize.query(query);
        console.log(`✅ Added Purchase column: ${column.name}`);
      } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Purchase column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding Purchase column ${column.name}:`, error.message);
        }
      }
    }
    
    // Fix KYC table - add missing occupation column
    console.log('\n🆔 Fixing KYC table...');
    const kycColumns = [
      { name: 'occupation', type: "ENUM('salaried', 'business', 'student', 'self_employed', 'other')", default: 'NULL' }
    ];
    
    for (const column of kycColumns) {
      try {
        const query = column.default === 'NULL' 
          ? `ALTER TABLE kyc_documents ADD COLUMN ${column.name} ${column.type};`
          : `ALTER TABLE kyc_documents ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default};`;
          
        await sequelize.query(query);
        console.log(`✅ Added KYC column: ${column.name}`);
      } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  KYC column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding KYC column ${column.name}:`, error.message);
        }
      }
    }
    
    // Update Purchase status enum to include all required values
    console.log('\n🔄 Updating Purchase status enum...');
    try {
      await sequelize.query(`
        ALTER TABLE purchases 
        MODIFY COLUMN status ENUM(
          'pending', 'admin_review', 'approved', 'documents_required', 
          'documents_submitted', 'documents_verified', 'confirmed', 
          'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'rejected'
        ) DEFAULT 'pending';
      `);
      console.log('✅ Updated Purchase status enum');
    } catch (error) {
      console.error('❌ Error updating Purchase status enum:', error.message);
    }
    
    console.log('\n🎉 Database schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in schema fix:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
fixDatabaseSchema();