const sequelize = require('../src/config/database');

async function fixListingSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Add the missing ownerAccountId column
    console.log('\n🔧 Adding missing ownerAccountId column to Listings table...');
    
    await sequelize.query(`
      ALTER TABLE Listings 
      ADD COLUMN ownerAccountId INT NULL,
      ADD CONSTRAINT fk_listings_owner_account 
      FOREIGN KEY (ownerAccountId) REFERENCES Users(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    
    console.log('✅ Successfully added ownerAccountId column');

    // Test the query that was failing
    console.log('\n🧪 Testing Listing query...');
    
    const testQuery = await sequelize.query(`
      SELECT COUNT(*) as count FROM Listings
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`✅ Found ${testQuery[0].count} listings in database`);

    // Test with the Sequelize model
    console.log('\n🧪 Testing Sequelize model...');
    const Listing = require('../src/models/Listing');
    const User = require('../src/models/User');
    
    // Import associations
    require('../src/models/associations');
    
    const listings = await Listing.findAll({
      limit: 5,
      include: [{ 
        model: User, 
        as: 'seller', 
        attributes: ['id', 'name', 'email'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Sequelize query successful - found ${listings.length} listings`);
    
    if (listings.length > 0) {
      console.log('\n📋 Sample listings:');
      listings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} - ${listing.category} - ₹${listing.price}`);
      });
    }

    console.log('\n🎉 Schema fix complete! Admin dashboard should now show listings.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // If column already exists, that's fine
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists, continuing...');
      
      // Test the query anyway
      try {
        const Listing = require('../src/models/Listing');
        const User = require('../src/models/User');
        require('../src/models/associations');
        
        const listings = await Listing.findAll({
          limit: 3,
          include: [{ 
            model: User, 
            as: 'seller', 
            attributes: ['id', 'name', 'email'],
            required: false
          }]
        });
        
        console.log(`✅ Query test successful - found ${listings.length} listings`);
      } catch (testError) {
        console.error('❌ Query test failed:', testError.message);
      }
    }
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixListingSchema();