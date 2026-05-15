const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

// Import associations
require('../src/models/associations');

async function createSekharRaviOwner() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    const ownerEmail = 'sekharravi@gmail.com';
    const ownerName = 'Sekhar Ravi';
    const ownerPhone = '+91-9876543210';
    const password = 'sekhar123';

    // Check if user already exists
    let user = await User.findOne({ where: { email: ownerEmail } });
    
    if (!user) {
      console.log(`\n👤 Creating user account for ${ownerName}...`);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await User.create({
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        password: hashedPassword,
        isVerified: true,
        role: 'user'
      });
      
      console.log(`✅ User account created with ID: ${user.id}`);
    } else {
      console.log(`✅ User account already exists with ID: ${user.id}`);
      
      // Update password if not set
      if (!user.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({
          password: hashedPassword,
          isVerified: true
        });
        console.log('✅ Password set for existing user');
      }
    }

    // Create sample properties for this owner
    console.log('\n🏠 Creating sample properties...');
    
    const sampleProperties = [
      {
        title: '3BHK Luxury Apartment in Banjara Hills',
        description: 'Spacious 3BHK apartment with modern amenities, parking, and great city view.',
        category: 'residential',
        subCategory: 'apartment',
        price: 8500000,
        priceType: 'fixed',
        location: 'Banjara Hills, Road No. 12',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        bedrooms: 3,
        bathrooms: 3,
        area: 1850,
        areaUnit: 'sqft',
        propertyAge: 2,
        facing: 'East',
        floor: 5,
        totalFloors: 12,
        parking: 'covered',
        furnishing: 'semi-furnished',
        amenities: ['gym', 'swimming pool', 'security', 'power backup', 'lift'],
        status: 'active',
        contactPerson: ownerName,
        contactPhone: ownerPhone,
        contactEmail: ownerEmail,
        commissionPercentage: 2.5,
        isVerified: true,
        isFeatured: true
      },
      {
        title: '2BHK Independent House for Rent',
        description: 'Well-maintained independent house with garden, perfect for small families.',
        category: 'residential',
        subCategory: 'independent house',
        price: 25000,
        priceType: 'monthly',
        location: 'Jubilee Hills, Plot No. 45',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        areaUnit: 'sqft',
        propertyAge: 5,
        facing: 'North',
        floor: 0,
        totalFloors: 1,
        parking: 'open',
        furnishing: 'furnished',
        amenities: ['garden', 'security', 'power backup'],
        status: 'active',
        contactPerson: ownerName,
        contactPhone: ownerPhone,
        contactEmail: ownerEmail,
        commissionPercentage: 1.5,
        isVerified: true,
        isFeatured: false
      },
      {
        title: 'Commercial Office Space in HITEC City',
        description: 'Premium office space in IT hub with all modern facilities and parking.',
        category: 'commercial',
        subCategory: 'office',
        price: 12000000,
        priceType: 'fixed',
        location: 'HITEC City, Cyber Towers',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        bedrooms: 0,
        bathrooms: 4,
        area: 2500,
        areaUnit: 'sqft',
        propertyAge: 1,
        facing: 'South',
        floor: 8,
        totalFloors: 20,
        parking: 'covered',
        furnishing: 'unfurnished',
        amenities: ['lift', 'security', 'power backup', 'conference room', 'cafeteria'],
        status: 'active',
        contactPerson: ownerName,
        contactPhone: ownerPhone,
        contactEmail: ownerEmail,
        commissionPercentage: 3.0,
        isVerified: true,
        isFeatured: true
      },
      {
        title: '4BHK Villa with Swimming Pool',
        description: 'Luxurious villa with private swimming pool, garden, and premium amenities.',
        category: 'residential',
        subCategory: 'villa',
        price: 15000000,
        priceType: 'fixed',
        location: 'Gachibowli, Villa Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        bedrooms: 4,
        bathrooms: 5,
        area: 3200,
        areaUnit: 'sqft',
        propertyAge: 0,
        facing: 'West',
        floor: 0,
        totalFloors: 2,
        parking: 'covered',
        furnishing: 'semi-furnished',
        amenities: ['swimming pool', 'garden', 'security', 'power backup', 'servant room'],
        status: 'sold',
        contactPerson: ownerName,
        contactPhone: ownerPhone,
        contactEmail: ownerEmail,
        commissionPercentage: 2.0,
        isVerified: true,
        isFeatured: true
      }
    ];

    // Create properties
    for (let i = 0; i < sampleProperties.length; i++) {
      const propertyData = {
        ...sampleProperties[i],
        userId: user.id,
        images: [`https://via.placeholder.com/800x600?text=Property+${i+1}+Image+1`, 
                `https://via.placeholder.com/800x600?text=Property+${i+1}+Image+2`],
        views: Math.floor(Math.random() * 500) + 50
      };

      const property = await Listing.create(propertyData);
      console.log(`✅ Created property: ${property.title} (ID: ${property.id})`);
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Owner Account Details:');
    console.log(`   Name: ${ownerName}`);
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Phone: ${ownerPhone}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${user.id}`);

    console.log('\n🌐 Access URLs:');
    console.log('   Login: http://localhost:5173/login');
    console.log('   Owner Dashboard: http://localhost:5173/owner/dashboard');

    console.log('\n📝 Login Instructions:');
    console.log('1. Go to http://localhost:5173/login');
    console.log(`2. Enter email: ${ownerEmail}`);
    console.log(`3. Enter password: ${password}`);
    console.log('4. After login, navigate to Owner Dashboard');

    console.log('\n🏠 Properties Created:');
    console.log('   - 3BHK Luxury Apartment (Active)');
    console.log('   - 2BHK Independent House for Rent (Active)');
    console.log('   - Commercial Office Space (Active)');
    console.log('   - 4BHK Villa with Pool (Sold)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
createSekharRaviOwner();