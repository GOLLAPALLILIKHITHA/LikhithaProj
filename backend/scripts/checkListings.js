const Listing = require('../src/models/Listing');
const User = require('../src/models/User');
const sequelize = require('../src/config/database');

async function checkListings() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get all listings
    const listings = await Listing.findAll({
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`\nTotal listings found: ${listings.length}\n`);

    if (listings.length > 0) {
      listings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title}`);
        console.log(`   Category: ${listing.category}`);
        console.log(`   SubCategory: ${listing.subCategory}`);
        console.log(`   City: ${listing.city}`);
        console.log(`   Price: ₹${listing.price}`);
        console.log(`   Status: ${listing.status}`);
        console.log(`   Created by: ${listing.seller?.name} (${listing.seller?.email})`);
        console.log(`   Created at: ${listing.createdAt}`);
        console.log('   ---');
      });
    } else {
      console.log('No listings found in the database.');
    }

    // Check specifically for furniture listings
    const furnitureListings = await Listing.findAll({
      where: { category: 'furniture' },
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email'] }]
    });

    console.log(`\nFurniture listings: ${furnitureListings.length}`);
    if (furnitureListings.length > 0) {
      furnitureListings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} - ${listing.subCategory} - ${listing.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkListings();