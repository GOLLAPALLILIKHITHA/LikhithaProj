const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const PropertyRental = require('../src/models/PropertyRental');

async function createCompletedRentals() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get rental properties (property_rent category)
    const rentalProperties = await Listing.findAll({ 
      where: { category: 'property_rent' },
      limit: 5
    });
    console.log(`📋 Found ${rentalProperties.length} rental properties`);

    // Get some users
    const users = await User.findAll({ limit: 3 });
    console.log(`👥 Found ${users.length} users`);

    if (rentalProperties.length === 0 || users.length === 0) {
      console.log('❌ Need at least 1 rental property and 1 user');
      process.exit(1);
    }

    // Create completed rentals for each property
    for (let i = 0; i < rentalProperties.length; i++) {
      const property = rentalProperties[i];
      const user = users[i % users.length];
      
      // Check if rental already exists
      const existingRental = await PropertyRental.findOne({
        where: { 
          userId: user.id, 
          listingId: property.id 
        }
      });

      if (existingRental) {
        // Update existing rental to completed status
        await existingRental.update({
          status: 'completed',
          paymentStatus: 'paid',
          monthlyPaymentStatus: 'completed',
          vacateRequested: false,
          vacateDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          paidUntilDate: new Date().toISOString().split('T')[0]
        });
        console.log(`✅ Updated existing rental for "${property.title}" by ${user.name} to completed`);
      } else {
        // Create new completed rental
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 2); // Started 2 months ago
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 7); // Ended 1 week ago
        
        const monthlyRent = property.price || 15000;
        const advancePayment = monthlyRent * 2;
        const firstMonthRent = monthlyRent;
        const initialPayment = advancePayment + firstMonthRent;

        const rental = await PropertyRental.create({
          userId: user.id,
          listingId: property.id,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          monthlyRent,
          advancePayment,
          firstMonthRent,
          initialPayment,
          totalAmount: initialPayment + (monthlyRent * 2), // 2 months rent
          paidUntilDate: endDate.toISOString().split('T')[0],
          paymentDayOfMonth: 11,
          status: 'completed',
          paymentStatus: 'paid',
          monthlyPaymentStatus: 'completed',
          vacateRequested: false,
          vacateDate: endDate.toISOString().split('T')[0],
          vacateReason: 'Completed rental period',
          razorpayOrderId: `order_${Date.now()}_${i}`,
          razorpayPaymentId: `pay_${Date.now()}_${i}`,
          tenantPhone: user.phone,
          tenantEmail: user.email,
          adminNotes: 'Sample completed rental for review testing'
        });

        console.log(`✅ Created completed rental for "${property.title}" by ${user.name}`);
      }
    }

    // Also create some active rentals that can be reviewed (started but not ended)
    for (let i = 0; i < Math.min(2, rentalProperties.length); i++) {
      const property = rentalProperties[i];
      const user = users[(i + 1) % users.length];
      
      // Check if active rental already exists
      const existingActiveRental = await PropertyRental.findOne({
        where: { 
          userId: user.id, 
          listingId: property.id,
          status: 'active'
        }
      });

      if (!existingActiveRental) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // Started 1 month ago
        
        const paidUntilDate = new Date();
        paidUntilDate.setMonth(paidUntilDate.getMonth() + 1); // Paid until next month
        
        const monthlyRent = property.price || 15000;
        const advancePayment = monthlyRent * 2;
        const firstMonthRent = monthlyRent;
        const initialPayment = advancePayment + firstMonthRent;

        const activeRental = await PropertyRental.create({
          userId: user.id,
          listingId: property.id,
          startDate: startDate.toISOString().split('T')[0],
          monthlyRent,
          advancePayment,
          firstMonthRent,
          initialPayment,
          totalAmount: initialPayment + (monthlyRent * 12), // 1 year rent
          paidUntilDate: paidUntilDate.toISOString().split('T')[0],
          paymentDayOfMonth: 11,
          status: 'active',
          paymentStatus: 'paid',
          monthlyPaymentStatus: 'current',
          vacateRequested: false,
          razorpayOrderId: `order_active_${Date.now()}_${i}`,
          razorpayPaymentId: `pay_active_${Date.now()}_${i}`,
          tenantPhone: user.phone,
          tenantEmail: user.email,
          adminNotes: 'Sample active rental for review testing'
        });

        console.log(`✅ Created active rental for "${property.title}" by ${user.name} (can review)`);
      }
    }

    console.log('\n🎉 Completed rentals created successfully!');
    console.log('\n📊 Summary:');
    console.log('- Users can now review properties they have rented');
    console.log('- Both completed and active rentals can be reviewed');
    console.log('- Reviews will show as "Verified Renter" badges');
    console.log('\n🌐 Test the review system in the rental dashboard!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating completed rentals:', error);
    process.exit(1);
  }
}

createCompletedRentals();