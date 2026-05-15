const sequelize = require('../src/config/database');

async function fixKycSchema() {
  try {
    console.log('🔧 Starting KYC table schema fix...');
    
    // Add all missing KYC columns
    const kycColumns = [
      { name: 'occupation', type: "ENUM('salaried', 'business', 'student', 'self_employed', 'other')", default: 'NULL' },
      { name: 'aadhaarNumber', type: 'VARCHAR(12)', default: 'NULL' },
      { name: 'aadhaarUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'panUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'jobIdUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'salarySlipUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'businessRegUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'gstCertUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'collegeIdUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'bonafideUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'workProofUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'otherDocUrl', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'otherDocName', type: 'VARCHAR(255)', default: 'NULL' },
      { name: 'adminNotes', type: 'TEXT', default: 'NULL' },
      { name: 'verifiedAt', type: 'DATETIME', default: 'NULL' }
    ];
    
    console.log('\n🆔 Adding missing KYC columns...');
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
    
    // Update KYC status enum to include all required values
    console.log('\n🔄 Updating KYC status enum...');
    try {
      await sequelize.query(`
        ALTER TABLE kyc_documents 
        MODIFY COLUMN status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending';
      `);
      console.log('✅ Updated KYC status enum');
    } catch (error) {
      console.error('❌ Error updating KYC status enum:', error.message);
    }
    
    console.log('\n🎉 KYC table schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in KYC schema fix:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
fixKycSchema();