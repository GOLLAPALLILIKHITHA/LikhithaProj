const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Purchase = require('../src/models/Purchase');
const PropertyRental = require('../src/models/PropertyRental');

async function createSampleTransactions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get existing users and listings
    const users = await User.findAll({ limit: 5 });
    const listings = await Listing.findAll();

    if (users.length === 0 || listings.length === 0) {
      console.log('❌ No users or listings found. Please create them first.');
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} users and ${listings.length} listings`);

    // Clear existing transactions (handle foreign key constraints)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DELETE FROM monthly_payments');
    await sequelize.query('DELETE FROM property_rentals');
    await sequelize.query('DELETE FROM purchases');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🧹 Cleared existing transactions');

    // Create sample purchases for different categories (excluding services and property_rent)
    const purchaseListings = listings.filter(l => 
      ['property_sell', 'furniture', 'materials', 'electronics', 'vehicles'].includes(l.category)
    );

    for (let i = 0; i < Math.min(purchaseListings.length, users.length); i++) {
      const listing = purchaseListings[i];
      const user = users[i];

      // Skip if user owns the listing
      if (listing.userId === user.id) continue;

      const purchase = await Purchase.create({
        userId: user.id,
        listingId: listing.id,
        category: listing.category,
        quantity: 1,
        unitPrice: listing.price || 1000,
        totalAmount: listing.price || 1000,
        status: 'completed', // Completed so user can review
        paymentStatus: 'paid',
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: user.phone,
        notes: `Sample purchase for testing reviews - ${listing.category}`
      });

      console.log(`✅ Created purchase: ${user.name} bought "${listing.title}" (${listing.category})`);
    }

    // Create sample rentals for rental properties
    const rentalListings = listings.filter(l => l.category === 'property_rent');

    for (let i = 0; i < Math.min(rentalListings.length, users.length); i++) {
      const listing = rentalListings[i];
      const user = users[i];

      // Skip if user owns the listing
      if (listing.userId === user.id) continue;

      const monthlyRent = listing.price || 25000;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Started 30 days ago

      const rental = await PropertyRental.create({
        userId: user.id,
        listingId: listing.id,
        startDate: startDate.toISOString().split('T')[0],
        monthlyRent: monthlyRent,
        advancePayment: monthlyRent * 2, // 2 months advance
        firstMonthRent: monthlyRent,
        initialPayment: monthlyRent * 3, // Advance + first month
        totalAmount: monthlyRent * 12, // 1 year contract
        paidUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Paid for next 30 days
        paymentDayOfMonth: startDate.getDate(),
        status: 'active', // Active rental so user can review
        paymentStatus: 'paid',
        tenantPhone: user.phone,
        tenantEmail: user.email,
        notes: `Sample rental for testing reviews`
      });

      console.log(`✅ Created rental: ${user.name} rented "${listing.title}" (₹${monthlyRent}/month)`);
    }

    console.log('\n🎉 Sample transactions created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Purchases: ${purchaseListings.length} (completed)`);
    console.log(`- Rentals: ${rentalListings.length} (active)`);
    console.log('\n✅ Users can now give reviews only after completing transactions!');
    console.log('\n🔒 Review System Rules:');
    console.log('- Property Sales: Review after purchase is completed');
    console.log('- Property Rentals: Review after rental starts');
    console.log('- Furniture/Materials: Review after delivery is completed');
    console.log('- Services: Review after service is completed');
    console.log('- One review per user per listing');
    console.log('- No reviews without valid transactions');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample transactions:', error);
    process.exit(1);
  }
}

createSampleTransactions();