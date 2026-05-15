const sequelize = require('../src/config/database');

// Import all models to register them
require('../src/models/User');
require('../src/models/Listing');
require('../src/models/Message');
require('../src/models/Review');
require('../src/models/Wishlist');
require('../src/models/Subscription');
require('../src/models/VisitBooking');
require('../src/models/PropertyRental');
require('../src/models/MonthlyPayment');
require('../src/models/Purchase');
require('../src/models/KYC');
require('../src/models/BuyRequest');
require('../src/models/RentalAgreement');
require('../src/models/RentPayment');
require('../src/models/RentNotification');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database with alter: true to add new columns
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
    console.log('📝 New columns added to existing tables');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();