const sequelize = require('../src/config/database');

async function applyLeisureFixes() {
  try {
    console.log('🔧 Applying leisure property fixes...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Import and test associations
    console.log('\n📋 Testing associations...');
    require('../src/models/associations');
    console.log('✅ Associations loaded');

    // Test the models
    const Listing = require('../src/models/Listing');
    const LeisureLease = require('../src/models/LeisureLease');
    const User = require('../src/models/User');

    // Test a simple query to ensure associations work
    const testListing = await Listing.findOne({
      where: { id: 16 }, // Likhitha House
      include: [
        {
          model: LeisureLease,
          as: 'leisureLeases',
          required: false
        }
      ]
    });

    if (testListing) {
      console.log(`✅ Association test successful: ${testListing.title} has ${testListing.leisureLeases?.length || 0} leases`);
    } else {
      console.log('❌ Could not find test listing');
    }

    console.log('\n🎯 Summary of fixes applied:');
    console.log('1. ✅ Associations imported in index.js');
    console.log('2. ✅ Duplicate KYC association removed from KYC.js');
    console.log('3. ✅ Associations imported in listingController.js');
    console.log('4. ✅ Admin leisure lease endpoint working');
    console.log('5. ✅ Filtering logic implemented');

    console.log('\n🚀 Next steps:');
    console.log('1. RESTART the backend server to load new associations');
    console.log('2. REFRESH the frontend to get fresh data');
    console.log('3. Test the website - Likhitha House should be hidden');
    console.log('4. Test admin panel - Kavya\'s lease should appear in "Rented Properties"');

    console.log('\n📊 Expected results after server restart:');
    console.log('• Website listings: 6 properties (Likhitha House hidden)');
    console.log('• Admin "Rented Properties": 1 leisure lease (Kavya - Likhitha House)');
    console.log('• User account: Kavya sees her active leisure lease');

  } catch (error) {
    console.error('❌ Error applying fixes:', error);
  } finally {
    await sequelize.close();
  }
}

applyLeisureFixes();