require('dotenv').config({ path: '../.env' });
const sequelize = require('../src/config/database');

async function updateListingsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Add missing columns to Listings table
    const queries = [
      `ALTER TABLE Listings ADD COLUMN contactPerson VARCHAR(255)`,
      `ALTER TABLE Listings ADD COLUMN contactPhone VARCHAR(255)`,
      `ALTER TABLE Listings ADD COLUMN contactEmail VARCHAR(255)`,
      `ALTER TABLE Listings ADD COLUMN whatsappNumber VARCHAR(255)`,
      `ALTER TABLE Listings ADD COLUMN businessName VARCHAR(255)`,
      `ALTER TABLE Listings ADD COLUMN businessAddress TEXT`
    ];

    console.log('🔧 Adding missing columns to Listings table...');
    
    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log('✅ Executed:', query.substring(0, 60) + '...');
      } catch (err) {
        if (err.original && err.original.errno === 1060) {
          console.log('⚠️  Column already exists, skipping...');
        } else {
          console.error('❌ Error:', err.message);
        }
      }
    }

    console.log('\n✅ Database schema updated successfully!');
    console.log('📋 You can now view listings in the admin panel.');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
  }
}

updateListingsTable();
