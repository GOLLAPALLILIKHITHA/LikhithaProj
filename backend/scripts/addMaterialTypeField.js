const sequelize = require('../src/config/database');

async function addMaterialTypeField() {
  try {
    console.log('🔄 Adding materialType field to Listings table...');
    
    // Add materialType column
    await sequelize.query(`
      ALTER TABLE Listings 
      ADD COLUMN materialType VARCHAR(255) DEFAULT NULL;
    `);
    
    console.log('✅ Successfully added materialType field to Listings table');
    
    // Update some sample listings with materialType for testing
    await sequelize.query(`
      UPDATE Listings 
      SET materialType = CASE 
        WHEN category = 'materials' AND subCategory LIKE '%Cement%' THEN 'Premium Quality'
        WHEN category = 'materials' AND subCategory LIKE '%Steel%' THEN 'ISI Marked'
        WHEN category = 'materials' AND subCategory LIKE '%Bricks%' THEN 'Standard Quality'
        WHEN category = 'materials' AND subCategory LIKE '%Sand%' THEN 'Certified'
        WHEN category = 'materials' AND subCategory LIKE '%Tiles%' THEN 'Premium Quality'
        WHEN category = 'materials' THEN 'Standard Quality'
        ELSE NULL
      END
      WHERE category = 'materials';
    `);
    
    console.log('✅ Updated sample material listings with materialType values');
    
  } catch (error) {
    console.error('❌ Error adding materialType field:', error);
    
    // If column already exists, that's okay
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  materialType column already exists, skipping...');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addMaterialTypeField()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });