const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Purchase = require('./src/models/Purchase');
const PropertyRental = require('./src/models/PropertyRental');
const BuyRequest = require('./src/models/BuyRequest');
const Subscription = require('./src/models/Subscription');
const Listing = require('./src/models/Listing');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');

    // Check Buy Requests
    console.log('=== BUY REQUESTS ===');
    const buyRequests = await BuyRequest.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'category'] }
      ]
    });
    console.log(`Total Buy Requests: ${buyRequests.length}`);
    buyRequests.forEach((req, index) => {
      console.log(`${index + 1}. ID: ${req.id}, Status: ${req.status}, Buyer: ${req.buyer?.name || 'N/A'}, Property: ${req.property?.title || 'N/A'}`);
    });
    console.log('');

    // Check Property Rentals
    console.log('=== PROPERTY RENTALS ===');
    const rentals = await PropertyRental.findAll({
      include: [
        { model: User, as: 'tenant', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'property', attributes: ['id', 'title', 'price', 'category'] }
      ]
    });
    console.log(`Total Property Rentals: ${rentals.length}`);
    rentals.forEach((rental, index) => {
      console.log(`${index + 1}. ID: ${rental.id}, Status: ${rental.status}, Payment Status: ${rental.paymentStatus || rental.currentPaymentStatus}, Tenant: ${rental.tenant?.name || 'N/A'}, Property: ${rental.property?.title || 'N/A'}`);
    });
    console.log('');

    // Check Purchases
    console.log('=== PURCHASES ===');
    const purchases = await Purchase.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
        { model: Listing, as: 'item', attributes: ['id', 'title', 'price', 'category'] }
      ]
    });
    console.log(`Total Purchases: ${purchases.length}`);
    purchases.forEach((purchase, index) => {
      console.log(`${index + 1}. ID: ${purchase.id}, Status: ${purchase.status}, Payment Status: ${purchase.paymentStatus}, Category: ${purchase.category}, Buyer: ${purchase.buyer?.name || 'N/A'}, Item: ${purchase.item?.title || 'N/A'}`);
    });
    console.log('');

    // Check Subscriptions
    console.log('=== SUBSCRIPTIONS ===');
    const subscriptions = await Subscription.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });
    console.log(`Total Subscriptions: ${subscriptions.length}`);
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub.id}, Status: ${sub.status}, Package: ${sub.packageType || sub.planName}, User: ${sub.user?.name || 'N/A'}, Amount: ${sub.amount || sub.price}`);
    });
    console.log('');

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Buy Requests: ${buyRequests.length}`);
    console.log(`Property Rentals: ${rentals.length}`);
    console.log(`Purchases: ${purchases.length}`);
    console.log(`Subscriptions: ${subscriptions.length}`);

  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();