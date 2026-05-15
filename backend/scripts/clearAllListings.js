require('dotenv').config();
const Listing = require('../src/models/Listing');
const Purchase = require('../src/models/Purchase');
const BuyRequest = require('../src/models/BuyRequest');
const Message = require('../src/models/Message');
const Wishlist = require('../src/models/Wishlist');
const VisitBooking = require('../src/models/VisitBooking');
const PropertyRental = require('../src/models/PropertyRental');
const MonthlyPayment = require('../src/models/MonthlyPayment');
const RentPayment = require('../src/models/RentPayment');
const RentNotification = require('../src/models/RentNotification');
const sequelize = require('../src/config/database');

async function clearAllListings() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get count before deletion
    const listingCount = await Listing.count();
    console.log(`📊 Found ${listingCount} listings in database`);

    if (listingCount === 0) {
      console.log('ℹ️  No listings to delete');
      process.exit(0);
    }

    console.log('');
    console.log('🔄 Deleting related records first...');

    // Delete in order of dependencies
    const monthlyPaymentsDeleted = await MonthlyPayment.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${monthlyPaymentsDeleted} monthly payments`);

    const rentPaymentsDeleted = await RentPayment.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${rentPaymentsDeleted} rent payments`);

    const rentNotificationsDeleted = await RentNotification.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${rentNotificationsDeleted} rent notifications`);

    const purchasesDeleted = await Purchase.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${purchasesDeleted} purchases`);

    const buyRequestsDeleted = await BuyRequest.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${buyRequestsDeleted} buy requests`);

    const rentalsDeleted = await PropertyRental.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${rentalsDeleted} property rentals`);

    const visitsDeleted = await VisitBooking.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${visitsDeleted} visit bookings`);

    const messagesDeleted = await Message.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${messagesDeleted} messages`);

    const wishlistDeleted = await Wishlist.destroy({ where: {}, force: true });
    console.log(`   🗑️  Deleted ${wishlistDeleted} wishlist items`);

    console.log('');
    console.log('🔄 Now deleting listings...');

    // Now delete all listings
    const deleted = await Listing.destroy({ 
      where: {},
      force: true
    });
    
    console.log(`🗑️  Deleted ${deleted} listings`);

    // Verify deletion
    const remaining = await Listing.count();
    console.log(`📊 Remaining listings: ${remaining}`);

    if (remaining === 0) {
      console.log('');
      console.log('✅ All listings and related data cleared successfully!');
      console.log('');
      console.log('You can now add new listings through the admin panel:');
      console.log('👉 http://localhost:5173/admin/listings/add');
    } else {
      console.log('⚠️  Some listings may still remain');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing listings:', error.message);
    process.exit(1);
  }
}

clearAllListings();
