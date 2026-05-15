require('dotenv').config({ path: '../.env' });
const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');

async function checkDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check listings
    const listingCount = await Listing.count();
    console.log(`📋 Total listings: ${listingCount}`);

    if (listingCount > 0) {
      const listings = await Listing.findAll({
        limit: 5,
        include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }]
      });
      console.log('\n📝 Sample listings:');
      listings.forEach(listing => {
        console.log(`- ${listing.title} (${listing.category}) - ${listing.city} - ₹${listing.price}`);
      });
    }

    // Check users
    const userCount = await User.count();
    console.log(`\n👥 Total users: ${userCount}`);

    // Check subscriptions
    const subscriptionCount = await Subscription.count();
    console.log(`💳 Total subscriptions: ${subscriptionCount}`);

    if (subscriptionCount > 0) {
      const subscriptions = await Subscription.findAll({
        limit: 5,
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
      });
      console.log('\n💰 Sample subscriptions:');
      subscriptions.forEach(sub => {
        console.log(`- ${sub.user?.name || 'Unknown'} - ${sub.packageType} - ₹${sub.amount/100} - ${sub.status}`);
      });
    }

    // Check categories
    const categories = await Listing.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });
    console.log('\n📊 Listings by category:');
    categories.forEach(cat => {
      console.log(`- ${cat.category}: ${cat.dataValues.count}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();