const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');

async function updateExistingPropertiesForLeisure() {
  try {
    console.log('🏖️ Updating existing rental properties for leisure feature...');

    // Get all rental properties
    const rentalProperties = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      attributes: ['id', 'title', 'location', 'city', 'price']
    });

    console.log(`Found ${rentalProperties.length} rental properties`);

    if (rentalProperties.length === 0) {
      console.log('No rental properties found to update.');
      return;
    }

    // Display properties for selection
    console.log('\n📋 Available Rental Properties:');
    console.log('=====================================');
    rentalProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title}`);
      console.log(`   Location: ${property.location}, ${property.city}`);
      console.log(`   Price: ₹${property.price?.toLocaleString()}/month`);
      console.log(`   ID: ${property.id}`);
      console.log('---');
    });

    // Sample update - you can modify these IDs based on your properties
    const leisurePropertyIds = [
      // Beach/vacation properties and premium properties for leisure
      16, // Likhitha House - Chennai (premium location)
      18, // Likki House - beach, Mumbai (beach property - perfect for leisure)
      22, // 3BHK House for Family Rent - Bangalore (premium family property)
      21  // 1BHK Furnished Flat - HSR Layout, Bangalore (furnished, good for leisure)
    ];

    if (leisurePropertyIds.length === 0) {
      console.log('\n⚠️  No property IDs specified for leisure conversion.');
      console.log('Please edit this script and add property IDs to the leisurePropertyIds array.');
      console.log('Example: const leisurePropertyIds = [1, 3, 5];');
      return;
    }

    // Update selected properties to be leisure properties
    const updateResult = await Listing.update(
      { isLeisure: true },
      { 
        where: { 
          id: leisurePropertyIds,
          category: 'property_rent'
        }
      }
    );

    console.log(`\n✅ Updated ${updateResult[0]} properties to leisure properties`);

    // Show updated properties
    const updatedProperties = await Listing.findAll({
      where: { 
        id: leisurePropertyIds,
        category: 'property_rent'
      },
      attributes: ['id', 'title', 'location', 'city', 'price', 'isLeisure']
    });

    console.log('\n🏖️ Updated Leisure Properties:');
    console.log('================================');
    updatedProperties.forEach(property => {
      console.log(`✓ ${property.title} (ID: ${property.id})`);
      console.log(`  Location: ${property.location}, ${property.city}`);
      console.log(`  Price: ₹${property.price?.toLocaleString()}/month`);
      console.log(`  Leisure: ${property.isLeisure ? 'Yes' : 'No'}`);
      console.log('---');
    });

    console.log('\n🎉 Leisure property update completed!');
    console.log('\n📝 What happens now:');
    console.log('  • Updated properties will show "Lease Property (Full Year)" button');
    console.log('  • Regular rental properties will show "Rent Property" button');
    console.log('  • Tenants can lease leisure properties for full year with upfront payment');

  } catch (error) {
    console.error('❌ Error updating properties for leisure:', error);
  } finally {
    await sequelize.close();
  }
}

// Alternative: Interactive update function
async function interactiveUpdate() {
  try {
    console.log('🏖️ Interactive Leisure Property Update');
    console.log('=====================================');

    // Get all rental properties
    const rentalProperties = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      attributes: ['id', 'title', 'location', 'city', 'price', 'isLeisure']
    });

    if (rentalProperties.length === 0) {
      console.log('No rental properties found.');
      return;
    }

    console.log('\nCurrent Rental Properties Status:');
    console.log('=================================');
    rentalProperties.forEach((property, index) => {
      const leisureStatus = property.isLeisure ? '🏖️ LEISURE' : '🏠 REGULAR';
      console.log(`${index + 1}. ${property.title} - ${leisureStatus}`);
      console.log(`   Location: ${property.location}, ${property.city}`);
      console.log(`   Price: ₹${property.price?.toLocaleString()}/month`);
      console.log(`   ID: ${property.id}`);
      console.log('---');
    });

    // Example updates - modify these based on your needs
    console.log('\n📝 To update properties, modify the script with specific property IDs:');
    console.log('');
    console.log('// Make properties leisure (full year lease):');
    console.log('const makeLeisure = [1, 3, 5]; // Replace with actual IDs');
    console.log('');
    console.log('// Make properties regular rental:');
    console.log('const makeRegular = [2, 4, 6]; // Replace with actual IDs');

  } catch (error) {
    console.error('❌ Error in interactive update:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
const args = process.argv.slice(2);
if (args.includes('--interactive') || args.includes('-i')) {
  interactiveUpdate();
} else {
  updateExistingPropertiesForLeisure();
}