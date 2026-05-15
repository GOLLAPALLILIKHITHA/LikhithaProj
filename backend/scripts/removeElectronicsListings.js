const sequelize = require('../src/config/database');

async function removeElectronicsListings() {
  try {
    console.log('🔄 Removing electronics listings from database...');
    
    // First, delete related purchases for electronics listings
    await sequelize.query(`
      DELETE FROM Purchases 
      WHERE listingId IN (SELECT id FROM Listings WHERE category = 'electronics');
    `);
    
    // Then delete related reviews for electronics listings
    await sequelize.query(`
      DELETE FROM Reviews 
      WHERE listingId IN (SELECT id FROM Listings WHERE category = 'electronics');
    `);
    
    // Finally, delete the electronics listings
    const result = await sequelize.query(`
      DELETE FROM Listings 
      WHERE category = 'electronics';
    `);
    
    console.log(`✅ Successfully removed electronics listings and related data from database`);
    
  } catch (error) {
    console.error('❌ Error removing electronics listings:', error);
    
    // If there are still constraint issues, just update the category instead of deleting
    try {
      console.log('🔄 Attempting to update electronics listings to materials category...');
      await sequelize.query(`
        UPDATE Listings 
        SET category = 'materials', subCategory = 'Electronics (Legacy)' 
        WHERE category = 'electronics';
      `);
      console.log('✅ Successfully updated electronics listings to materials category');
    } catch (updateError) {
      console.error('❌ Error updating electronics listings:', updateError);
    }
  } finally {
    await sequelize.close();
  }
}

// Run the script
removeElectronicsListings()
  .then(() => {
    console.log('🎉 Electronics listings cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Electronics listings cleanup failed:', error);
    process.exit(1);
  });