const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'mysql', logging: false
});

const listings = [
  {
    title: '3 BHK Premium Apartment in Whitefield',
    description: 'Spacious 3 BHK apartment in the heart of Whitefield, Bangalore. Modern interiors, fully furnished with premium fittings. Close to IT parks, malls, and schools. 24/7 security, power backup, and covered parking.',
    category: 'property_sell',
    subCategory: 'Full House',
    price: 8500000,
    priceType: 'fixed',
    location: 'Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    areaUnit: 'sqft',
    propertyAge: '2 Years',
    facing: 'East',
    floor: 5,
    totalFloors: 12,
    parking: 'Covered',
    furnishing: 'Semi-Furnished',
    amenities: JSON.stringify(['Lift', 'Security', 'Power Backup', 'Gym', 'Swimming Pool', 'Parking']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ]),
    isVerified: 1, isFeatured: 1, status: 'active', userId: 1
  },
  {
    title: '2 BHK Independent House in Koramangala',
    description: 'Beautiful 2 BHK independent house in prime Koramangala location. Newly constructed with modern design. Vastu compliant, east-facing. Walking distance to restaurants, cafes, and metro station.',
    category: 'property_sell',
    subCategory: 'Full House',
    price: 6200000,
    priceType: 'negotiable',
    location: 'Koramangala 5th Block',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560095',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    areaUnit: 'sqft',
    propertyAge: '1 Year',
    facing: 'North',
    floor: 1,
    totalFloors: 2,
    parking: 'Open',
    furnishing: 'Unfurnished',
    amenities: JSON.stringify(['Security', 'Power Backup', 'Garden', 'Parking']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
    ]),
    isVerified: 1, isFeatured: 0, status: 'active', userId: 1
  },
  {
    title: '2 BHK Furnished Flat for Rent in Indiranagar',
    description: 'Fully furnished 2 BHK flat available for rent in Indiranagar. Premium location with easy access to metro, restaurants, and shopping. Includes all appliances — AC, washing machine, refrigerator, and modular kitchen.',
    category: 'property_rent',
    subCategory: 'House',
    price: 32000,
    priceType: 'per_month',
    location: 'Indiranagar 12th Main',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    areaUnit: 'sqft',
    propertyAge: '3 Years',
    facing: 'West',
    floor: 3,
    totalFloors: 6,
    parking: 'Covered',
    furnishing: 'Fully Furnished',
    availableTimeSlots: JSON.stringify(['Morning', 'Evening']),
    amenities: JSON.stringify(['Lift', 'Security', 'Power Backup', 'AC', 'Washing Machine', 'Refrigerator']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
    ]),
    isVerified: 1, isFeatured: 1, status: 'active', userId: 1
  },
  {
    title: '1 BHK Studio Apartment for Rent in HSR Layout',
    description: 'Cozy 1 BHK studio apartment in HSR Layout, ideal for working professionals. Semi-furnished with wardrobe, bed, and kitchen fittings. Quiet neighbourhood, close to tech parks and daily essentials.',
    category: 'property_rent',
    subCategory: 'House',
    price: 18000,
    priceType: 'per_month',
    location: 'HSR Layout Sector 2',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560102',
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    areaUnit: 'sqft',
    propertyAge: '4 Years',
    facing: 'South',
    floor: 2,
    totalFloors: 4,
    parking: 'Open',
    furnishing: 'Semi-Furnished',
    availableTimeSlots: JSON.stringify(['Morning', 'Afternoon', 'Evening']),
    amenities: JSON.stringify(['Security', 'Power Backup', 'Parking']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop'
    ]),
    isVerified: 1, isFeatured: 0, status: 'active', userId: 1
  }
];

(async () => {
  try {
    for (const l of listings) {
      await sequelize.query(
        `INSERT INTO Listings (title, description, category, subCategory, price, priceType, location, city, state, pincode, bedrooms, bathrooms, area, areaUnit, propertyAge, facing, floor, totalFloors, parking, furnishing, availableTimeSlots, amenities, images, isVerified, isFeatured, status, userId, views, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
        { replacements: [
          l.title, l.description, l.category, l.subCategory, l.price, l.priceType,
          l.location, l.city, l.state, l.pincode, l.bedrooms, l.bathrooms, l.area,
          l.areaUnit, l.propertyAge, l.facing, l.floor, l.totalFloors, l.parking,
          l.furnishing, l.availableTimeSlots || null, l.amenities, l.images,
          l.isVerified, l.isFeatured, l.status, l.userId
        ]}
      );
      console.log('Added:', l.title);
    }
    console.log('\nAll 4 listings added successfully!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    sequelize.close();
  }
})();
