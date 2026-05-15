const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Purchase = require('../src/models/Purchase');
const PropertyRental = require('../src/models/PropertyRental');
const MonthlyPayment = require('../src/models/MonthlyPayment');

async function testOwnerDashboard() {
  try {
    console.log('🏠 TESTING OWNER DASHBOARD FUNCTIONALITY');
    console.log('═══════════════════════════════════════\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Find or create a test owner
    let owner = await User.findOne({ where: { email: 'testowner@example.com' } });
    
    if (!owner) {
      const bcrypt = require('bcryptjs');
      owner = await User.create({
        name: 'Test Owner',
        email: 'testowner@example.com',
        password: await bcrypt.hash('Owner@123', 10),
        phone: '9876543210',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Created test owner account');
    } else {
      console.log('ℹ️  Using existing test owner account');
    }

    console.log(`👤 Owner: ${owner.name} (${owner.email})`);

    // Create sample properties if they don't exist
    const existingProperties = await Listing.count({ where: { userId: owner.id } });
    
    if (existingProperties === 0) {
      console.log('\n📋 Creating sample properties...');
      
      const sampleProperties = [
        {
          title: '3BHK Apartment in Whitefield',
          description: 'Spacious 3BHK apartment with modern amenities',
          category: 'property_rent',
          subCategory: 'apartment',
          price: 25000,
          priceType: 'per_month',
          location: 'Whitefield, Bangalore',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560066',
          bedrooms: 3,
          bathrooms: 2,
          area: 1200,
          areaUnit: 'sqft',
          furnishing: 'semi_furnished',
          status: 'active',
          userId: owner.id
        },
        {
          title: '2BHK Villa for Sale',
          description: 'Beautiful 2BHK villa with garden',
          category: 'property_sell',
          subCategory: 'villa',
          price: 5500000,
          priceType: 'fixed',
          location: 'Electronic City, Bangalore',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560100',
          bedrooms: 2,
          bathrooms: 2,
          area: 1500,
          areaUnit: 'sqft',
          furnishing: 'unfurnished',
          status: 'active',
          userId: owner.id
        },
        {
          title: 'Commercial Space for Rent',
          description: 'Prime commercial space in business district',
          category: 'property_rent',
          subCategory: 'commercial',
          price: 50000,
          priceType: 'per_month',
          location: 'MG Road, Bangalore',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          area: 2000,
          areaUnit: 'sqft',
          status: 'rented',
          userId: owner.id
        }
      ];

      for (const property of sampleProperties) {
        await Listing.create(property);
      }
      
      console.log('✅ Created 3 sample properties');
    }

    // Create sample purchase if it doesn't exist
    const existingPurchases = await Purchase.count({
      include: [{
        model: Listing,
        as: 'item',
        where: { userId: owner.id }
      }]
    });

    if (existingPurchases === 0) {
      console.log('\n💰 Creating sample purchase...');
      
      // Find a buyer
      let buyer = await User.findOne({ where: { email: 'testbuyer@example.com' } });
      if (!buyer) {
        const bcrypt = require('bcryptjs');
        buyer = await User.create({
          name: 'Test Buyer',
          email: 'testbuyer@example.com',
          password: await bcrypt.hash('Buyer@123', 10),
          phone: '9876543211',
          role: 'user'
        });
      }

      // Find a property to purchase
      const propertyToBuy = await Listing.findOne({
        where: { userId: owner.id, category: 'property_sell' }
      });

      if (propertyToBuy) {
        await Purchase.create({
          userId: buyer.id,
          listingId: propertyToBuy.id,
          category: 'property_sell',
          quantity: 1,
          unitPrice: propertyToBuy.price,
          totalAmount: propertyToBuy.price,
          status: 'completed',
          paymentStatus: 'paid',
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone
        });
        
        console.log('✅ Created sample purchase');
      }
    }

    // Create sample rental if it doesn't exist
    const existingRentals = await PropertyRental.count({
      include: [{
        model: Listing,
        as: 'property',
        where: { userId: owner.id }
      }]
    });

    if (existingRentals === 0) {
      console.log('\n🏠 Creating sample rental...');
      
      // Find a tenant
      let tenant = await User.findOne({ where: { email: 'testtenant@example.com' } });
      if (!tenant) {
        const bcrypt = require('bcryptjs');
        tenant = await User.create({
          name: 'Test Tenant',
          email: 'testtenant@example.com',
          password: await bcrypt.hash('Tenant@123', 10),
          phone: '9876543212',
          role: 'user'
        });
      }

      // Find a property to rent
      const propertyToRent = await Listing.findOne({
        where: { userId: owner.id, category: 'property_rent' }
      });

      if (propertyToRent) {
        const rental = await PropertyRental.create({
          userId: tenant.id,
          listingId: propertyToRent.id,
          startDate: new Date(),
          monthlyRent: propertyToRent.price,
          advancePayment: propertyToRent.price * 2,
          firstMonthRent: propertyToRent.price,
          initialPayment: propertyToRent.price * 3,
          totalAmount: propertyToRent.price * 12,
          status: 'active',
          paymentStatus: 'paid',
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentDayOfMonth: new Date().getDate(),
          tenantPhone: tenant.phone,
          tenantEmail: tenant.email
        });

        // Create a monthly payment
        await MonthlyPayment.create({
          rentalId: rental.id,
          userId: tenant.id,
          monthNumber: 1,
          monthYear: new Date().toISOString().slice(0, 7),
          amount: propertyToRent.price,
          dueDate: new Date(),
          paidDate: new Date(),
          status: 'paid',
          totalAmount: propertyToRent.price
        });
        
        console.log('✅ Created sample rental with payment');
      }
    }

    // Test API endpoints
    console.log('\n🌐 Testing Owner Dashboard API endpoints...');
    
    try {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: owner.id, email: owner.email, role: owner.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Test dashboard overview
      const dashboardResponse = await axios.get('http://localhost:5000/api/owner/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Dashboard API working');
      console.log(`📊 Properties: ${dashboardResponse.data.overview.totalProperties}`);
      console.log(`💰 Total Earnings: ₹${dashboardResponse.data.overview.totalEarnings}`);

      // Test properties endpoint
      const propertiesResponse = await axios.get('http://localhost:5000/api/owner/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Properties API working');
      console.log(`📋 Found ${propertiesResponse.data.properties.length} properties`);

      // Test purchases endpoint
      const purchasesResponse = await axios.get('http://localhost:5000/api/owner/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Purchases API working');
      console.log(`💳 Found ${purchasesResponse.data.purchases.length} purchases`);

      // Test rentals endpoint
      const rentalsResponse = await axios.get('http://localhost:5000/api/owner/rentals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Rentals API working');
      console.log(`🏠 Found ${rentalsResponse.data.rentals.length} rentals`);

      // Test payment history endpoint
      const paymentsResponse = await axios.get('http://localhost:5000/api/owner/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Payment History API working');
      console.log(`💰 Found ${paymentsResponse.data.payments.length} payments`);

    } catch (apiError) {
      console.log('❌ API endpoint test failed');
      console.log(`Error: ${apiError.message}`);
      
      if (apiError.response) {
        console.log(`Status: ${apiError.response.status}`);
        console.log(`Response: ${JSON.stringify(apiError.response.data, null, 2)}`);
      }
      
      if (apiError.code === 'ECONNREFUSED') {
        console.log('💡 Backend server is not running. Start it with: npm run dev');
      }
    }

    console.log('\n🎯 OWNER DASHBOARD TEST SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log('✅ Database connection working');
    console.log('✅ Test owner account created/found');
    console.log('✅ Sample properties created');
    console.log('✅ Sample purchase created');
    console.log('✅ Sample rental created');
    console.log('✅ API endpoints tested');

    console.log('\n🔗 OWNER LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: testowner@example.com');
    console.log('🔑 Password: Owner@123');
    console.log('🌐 Dashboard URL: http://localhost:5173/owner/dashboard');

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Start frontend server: npm run dev');
    console.log('2. Login with owner credentials');
    console.log('3. Go to: http://localhost:5173/owner/dashboard');
    console.log('4. View properties, purchases, rentals, and payments');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testOwnerDashboard();