const sequelize = require('../src/config/database');

async function addReviewColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Add new columns to Reviews table
    try {
      await sequelize.query(`
        ALTER TABLE Reviews 
        ADD COLUMN transactionType ENUM('purchase', 'rental', 'service') NULL COMMENT 'Type of transaction that enabled this review',
        ADD COLUMN isVerified BOOLEAN DEFAULT TRUE COMMENT 'Whether this review is from a verified transaction'
      `);
      console.log('✅ Added new columns to Reviews table');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns already exist in Reviews table');
      } else {
        throw error;
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addReviewColumns();