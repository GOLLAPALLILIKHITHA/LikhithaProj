const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');

async function updateRentalPricesForTesting() {
  try {
    console.log('💰 Updating rental property prices for easy Razorpay testing...');

    // Get all rental properties
    const rentalProperties = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      attributes: ['id', 'title', 'location', 'city', 'price', 'isLeisure']
    });

    console.log(`Found ${rentalProperties.length} rental properties`);

    if (rentalProperties.length === 0) {
      console.log('No rental properties found to update.');
      return;
    }

    // Display current properties
    console.log('\n📋 Current Rental Properties:');
    console.log('=====================================');
    rentalProperties.forEach((property, index) => {
      const leisureStatus = property.isLeisure ? '🏖️ LEISURE' : '🏠 REGULAR';
      console.log(`${index + 1}. ${property.title} - ${leisureStatus}`);
      console.log(`   Location: ${property.location}, ${property.city}`);
      console.log(`   Current Price: ₹${property.price?.toLocaleString()}/month`);
      console.log(`   ID: ${property.id}`);
      console.log('---');
    });

    // Define test prices (₹100-150 range for easy testing)
    const testPrices = [100, 110, 120, 130, 140, 150];
    
    console.log('\n🔄 Updating prices to test-friendly amounts...');

    // Update each property with a test price
    for (let i = 0; i < rentalProperties.length; i++) {
      const property = rentalProperties[i];
      const newPrice = testPrices[i % testPrices.length]; // Cycle through test prices
      
      await Listing.update(
        { price: newPrice },
        { 
          where: { 
            id: property.id,
            category: 'property_rent'
          }
        }
      );

      console.log(`✅ Updated "${property.title}" from ₹${property.price} to ₹${newPrice}/month`);
    }

    // Show updated properties
    const updatedProperties = await Listing.findAll({
      where: { 
        category: 'property_rent',
        status: 'active'
      },
      attributes: ['id', 'title', 'location', 'city', 'price', 'isLeisure']
    });

    console.log('\n💰 Updated Rental Properties (Test Prices):');
    console.log('==========================================');
    updatedProperties.forEach(property => {
      const leisureStatus = property.isLeisure ? '🏖️ LEISURE' : '🏠 REGULAR';
      const yearlyPrice = property.isLeisure ? ` (₹${(property.price * 12).toLocaleString()}/year for leisure)` : '';
      console.log(`✓ ${property.title} - ${leisureStatus}`);
      console.log(`  Location: ${property.location}, ${property.city}`);
      console.log(`  Price: ₹${property.price}/month${yearlyPrice}`);
      console.log(`  ID: ${property.id}`);
      console.log('---');
    });

    console.log('\n🎉 Price update completed!');
    console.log('\n📝 Benefits for testing:');
    console.log('  • Monthly rentals: ₹100-150 (easy to test)');
    console.log('  • Leisure leases: ₹1,200-1,800/year (12x monthly)');
    console.log('  • Perfect for Razorpay test payments');
    console.log('  • No need to use large amounts during development');

  } catch (error) {
    console.error('❌ Error updating rental prices:', error);
  } finally {
    await sequelize.close();
  }
}

// Alternative: Reset to original prices function
async function resetToOriginalPrices() {
  try {
    console.log('🔄 Resetting rental prices to realistic amounts...');

    const originalPrices = {
      14: 15000, // Modern Test Apartment
      15: 16000, // Sekhar Test House  
      16: 25000, // Likhitha House
      18: 12000, // Likki House
      21: 25000, // 1BHK Furnished Flat
      22: 45000, // 3BHK House for Family
      42: 10000  // siva
    };

    for (const [propertyId, originalPrice] of Object.entries(originalPrices)) {
      await Listing.update(
        { price: originalPrice },
        { 
          where: { 
            id: parseInt(propertyId),
            category: 'property_rent'
          }
        }
      );
      console.log(`✅ Reset property ID ${propertyId} to ₹${originalPrice.toLocaleString()}/month`);
    }

    console.log('\n🎉 Prices reset to original realistic amounts!');

  } catch (error) {
    console.error('❌ Error resetting prices:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
const args = process.argv.slice(2);
if (args.includes('--reset') || args.includes('-r')) {
  resetToOriginalPrices();
} else {
  updateRentalPricesForTesting();
}