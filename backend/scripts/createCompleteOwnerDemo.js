const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Purchase = require('../src/models/Purchase');
const PropertyRental = require('../src/models/PropertyRental');
const MonthlyPayment = require('../src/models/MonthlyPayment');

async function createCompleteOwnerDemo() {
  try {
    console.log('🏠 CREATING COMPLETE OWNER DASHBOARD DEMO');
    console.log('═══════════════════════════════════════\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create demo owner account
    const ownerEmail = 'demo.owner@example.com';
    let owner = await User.findOne({ where: { email: ownerEmail } });
    
    if (!owner) {
      owner = await User.create({
        name: 'Demo Property Owner',
        email: ownerEmail,
        password: await bcrypt.hash('Owner@123', 10),
        phone: '9876543210',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Created demo owner account');
    } else {
      console.log('ℹ️  Using existing demo owner account');
    }

    // Create demo buyer accounts
    const buyers = [
      { name: 'John Buyer', email: 'john.buyer@example.com', phone: '9876543211' },
      { name: 'Sarah Customer', email: 'sarah.customer@example.com', phone: '9876543212' },
      { name: 'Mike Tenant', email: 'mike.tenant@example.com', phone: '9876543213' }
    ];

    const createdBuyers = [];
    for (const buyerData of buyers) {
      let buyer = await User.findOne({ where: { email: buyerData.email } });
      if (!buyer) {
        buyer = await User.create({
          name: buyerData.name,
          email: buyerData.email,
          password: await bcrypt.hash('Buyer@123', 10),
          phone: buyerData.phone,
          role: 'user'
        });
      }
      createdBuyers.push(buyer);
    }
    console.log('✅ Created demo buyer/tenant accounts');

    // Create demo properties
    const properties = [
      {
        title: '3BHK Luxury Apartment in Whitefield',
        description: 'Spacious 3BHK apartment with modern amenities, swimming pool, gym, and 24/7 security.',
        category: 'property_sell',
        subCategory: 'apartment',
        price: 8500000,
        priceType: 'fixed',
        location: 'Whitefield, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        bedrooms: 3,
        bathrooms: 2,
        area: 1450,
        areaUnit: 'sqft',
        furnishing: 'semi_furnished',
        status: 'sold',
        contactPerson: owner.name,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        userId: owner.id
      },
      {
        title: '2BHK Rental Apartment in Electronic City',
        description: 'Well-maintained 2BHK apartment perfect for small families, close to IT parks.',
        category: 'property_rent',
        subCategory: 'apartment',
        price: 28000,
        priceType: 'per_month',
        location: 'Electronic City, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560100',
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        areaUnit: 'sqft',
        furnishing: 'fully_furnished',
        status: 'rented',
        contactPerson: owner.name,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        userId: owner.id
      },
      {
        title: 'Commercial Office Space in MG Road',
        description: 'Prime commercial space in the heart of Bangalore, perfect for startups and small businesses.',
        category: 'property_rent',
        subCategory: 'commercial',
        price: 75000,
        priceType: 'per_month',
        location: 'MG Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        area: 2500,
        areaUnit: 'sqft',
        status: 'active',
        contactPerson: owner.name,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        userId: owner.id
      },
      {
        title: 'Independent Villa in Sarjapur',
        description: 'Beautiful independent villa with garden, perfect for families looking for spacious living.',
        category: 'property_sell',
        subCategory: 'villa',
        price: 12500000,
        priceType: 'fixed',
        location: 'Sarjapur Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560035',
        bedrooms: 4,
        bathrooms: 3,
        area: 2200,
        areaUnit: 'sqft',
        furnishing: 'unfurnished',
        status: 'active',
        contactPerson: owner.name,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        userId: owner.id
      }
    ];

    const createdProperties = [];
    for (const propertyData of properties) {
      const property = await Listing.create(propertyData);
      createdProperties.push(property);
    }
    console.log('✅ Created 4 demo properties');

    // Create demo purchases
    const soldProperty = createdProperties.find(p => p.status === 'sold');
    if (soldProperty) {
      const purchase = await Purchase.create({
        userId: createdBuyers[0].id,
        listingId: soldProperty.id,
        category: 'property_sell',
        quantity: 1,
        unitPrice: soldProperty.price,
        totalAmount: soldProperty.price,
        status: 'completed',
        paymentStatus: 'paid',
        buyerName: createdBuyers[0].name,
        buyerEmail: createdBuyers[0].email,
        buyerPhone: createdBuyers[0].phone,
        deliveryAddress: '123 Buyer Street, Bangalore',
        notes: 'Excited to move into this beautiful apartment!'
      });
      console.log('✅ Created demo purchase transaction');
    }

    // Create demo rental
    const rentedProperty = createdProperties.find(p => p.status === 'rented');
    if (rentedProperty) {
      const rental = await PropertyRental.create({
        userId: createdBuyers[2].id,
        listingId: rentedProperty.id,
        startDate: new Date('2024-01-01'),
        monthlyRent: rentedProperty.price,
        advancePayment: rentedProperty.price * 2,
        firstMonthRent: rentedProperty.price,
        initialPayment: rentedProperty.price * 3,
        totalAmount: rentedProperty.price * 12,
        status: 'active',
        paymentStatus: 'paid',
        nextPaymentDue: new Date('2024-12-01'),
        paymentDayOfMonth: 1,
        tenantPhone: createdBuyers[2].phone,
        tenantEmail: createdBuyers[2].email,
        paidUntilDate: new Date('2024-11-30')
      });

      // Create monthly payments for the rental
      const months = [
        { month: 1, year: 2024, status: 'paid', paidDate: '2024-01-01' },
        { month: 2, year: 2024, status: 'paid', paidDate: '2024-02-01' },
        { month: 3, year: 2024, status: 'paid', paidDate: '2024-03-01' },
        { month: 4, year: 2024, status: 'paid', paidDate: '2024-04-01' },
        { month: 5, year: 2024, status: 'paid', paidDate: '2024-05-01' },
        { month: 6, year: 2024, status: 'paid', paidDate: '2024-06-01' },
        { month: 7, year: 2024, status: 'paid', paidDate: '2024-07-01' },
        { month: 8, year: 2024, status: 'paid', paidDate: '2024-08-01' },
        { month: 9, year: 2024, status: 'paid', paidDate: '2024-09-01' },
        { month: 10, year: 2024, status: 'paid', paidDate: '2024-10-01' },
        { month: 11, year: 2024, status: 'paid', paidDate: '2024-11-01' },
        { month: 12, year: 2024, status: 'pending', paidDate: null }
      ];

      for (const monthData of months) {
        await MonthlyPayment.create({
          rentalId: rental.id,
          userId: createdBuyers[2].id,
          monthNumber: monthData.month,
          monthYear: `${monthData.year}-${monthData.month.toString().padStart(2, '0')}`,
          amount: rentedProperty.price,
          dueDate: new Date(`${monthData.year}-${monthData.month}-01`),
          paidDate: monthData.paidDate ? new Date(monthData.paidDate) : null,
          status: monthData.status,
          totalAmount: rentedProperty.price
        });
      }
      console.log('✅ Created demo rental with 11 paid months');
    }

    // Create additional purchase for another property
    const activeProperty = createdProperties.find(p => p.status === 'active' && p.category === 'property_sell');
    if (activeProperty) {
      const purchase2 = await Purchase.create({
        userId: createdBuyers[1].id,
        listingId: activeProperty.id,
        category: 'property_sell',
        quantity: 1,
        unitPrice: activeProperty.price,
        totalAmount: activeProperty.price,
        status: 'pending',
        paymentStatus: 'pending',
        buyerName: createdBuyers[1].name,
        buyerEmail: createdBuyers[1].email,
        buyerPhone: createdBuyers[1].phone,
        deliveryAddress: '456 Customer Avenue, Bangalore',
        notes: 'Looking forward to finalizing this purchase soon!'
      });
      console.log('✅ Created additional pending purchase');
    }

    console.log('\n🎉 DEMO DATA CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    
    console.log('\n📊 DEMO SUMMARY:');
    console.log(`👤 Owner Account: ${owner.name} (${owner.email})`);
    console.log(`🏠 Properties Created: ${createdProperties.length}`);
    console.log(`💰 Purchase Transactions: 2 (1 completed, 1 pending)`);
    console.log(`🏠 Rental Agreements: 1 active with 11 months paid`);
    console.log(`👥 Buyer/Tenant Accounts: ${createdBuyers.length}`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('🏠 PROPERTY OWNER:');
    console.log(`   Email: ${owner.email}`);
    console.log('   Password: Owner@123');
    console.log('   Dashboard: http://localhost:5173/owner/dashboard');
    
    console.log('\n👥 BUYERS/TENANTS:');
    createdBuyers.forEach((buyer, index) => {
      console.log(`   ${index + 1}. ${buyer.name}: ${buyer.email} / Buyer@123`);
    });

    console.log('\n🔗 ADMIN ACCESS:');
    console.log('   Email: sivaprasad072611@gmail.com');
    console.log('   Password: Admin@123456');
    console.log('   Owner Management: http://localhost:5173/admin/owner-management');

    console.log('\n📋 WHAT YOU CAN TEST:');
    console.log('1. Login as owner and view dashboard');
    console.log('2. See all properties with buyer/tenant details');
    console.log('3. View individual property details with transactions');
    console.log('4. Check payment history and analytics');
    console.log('5. Login as admin and manage owner accounts');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as owner and explore the dashboard');
    console.log('4. Click "View All Properties" to see property list');
    console.log('5. Click "View Buyers/Tenants" on any property');

    process.exit(0);
  } catch (error) {
    console.error('❌ Demo creation failed:', error.message);
    process.exit(1);
  }
}

createCompleteOwnerDemo();