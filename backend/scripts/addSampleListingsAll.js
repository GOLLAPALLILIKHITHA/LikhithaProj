const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

const sampleListings = [
  // PROPERTY SELL
  {
    title: "3BHK Luxury Villa in Koramangala",
    description: "Beautiful 3BHK villa with modern amenities, garden, and parking. Prime location near tech parks and malls.",
    category: "property_sell",
    subCategory: "Villa",
    price: 8500000,
    priceType: "negotiable",
    location: "Koramangala 5th Block",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560095",
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    areaUnit: "sqft",
    propertyAge: "2 years",
    facing: "East",
    floor: 0,
    totalFloors: 2,
    parking: "2 Car",
    furnishing: "Semi-Furnished",
    amenities: ["Garden", "Security", "Power Backup", "Water Supply"],
    contactPerson: "Rajesh Kumar",
    contactPhone: "9876543210",
    contactEmail: "rajesh@example.com",
    businessName: "Kumar Properties",
    businessAddress: "Koramangala, Bangalore",
    commissionPercentage: 2.5,
    isVerified: true,
    isFeatured: true,
    status: "active"
  },
  {
    title: "2BHK Apartment in Whitefield",
    description: "Spacious 2BHK apartment with balcony, lift, and security. Close to IT companies and shopping centers.",
    category: "property_sell",
    subCategory: "Apartment",
    price: 4200000,
    priceType: "fixed",
    location: "Whitefield Main Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560066",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    areaUnit: "sqft",
    propertyAge: "5 years",
    facing: "North",
    floor: 4,
    totalFloors: 8,
    parking: "1 Car",
    furnishing: "Unfurnished",
    amenities: ["Lift", "Security", "Gym", "Swimming Pool"],
    contactPerson: "Priya Sharma",
    contactPhone: "9876543211",
    contactEmail: "priya@example.com",
    businessName: "Sharma Realty",
    businessAddress: "Whitefield, Bangalore",
    commissionPercentage: 3.0,
    isVerified: true,
    status: "active"
  },

  // PROPERTY RENT
  {
    title: "1BHK Furnished Flat for Rent",
    description: "Fully furnished 1BHK flat with all modern amenities. Perfect for working professionals.",
    category: "property_rent",
    subCategory: "Apartment",
    price: 25000,
    priceType: "per_month",
    location: "HSR Layout Sector 2",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560102",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    areaUnit: "sqft",
    propertyAge: "3 years",
    facing: "South",
    floor: 2,
    totalFloors: 5,
    parking: "Bike",
    furnishing: "Fully Furnished",
    availableTimeSlots: ["Morning", "Evening"],
    amenities: ["WiFi", "AC", "Washing Machine", "Refrigerator"],
    contactPerson: "Amit Patel",
    contactPhone: "9876543212",
    contactEmail: "amit@example.com",
    whatsappNumber: "9876543212",
    businessName: "Patel Rentals",
    businessAddress: "HSR Layout, Bangalore",
    commissionPercentage: 1.0,
    isVerified: true,
    status: "active"
  },
  {
    title: "3BHK House for Family Rent",
    description: "Spacious 3BHK independent house with garden and parking. Family-friendly neighborhood.",
    category: "property_rent",
    subCategory: "House",
    price: 45000,
    priceType: "per_month",
    location: "Jayanagar 4th Block",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560011",
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    areaUnit: "sqft",
    propertyAge: "8 years",
    facing: "East",
    floor: 0,
    totalFloors: 1,
    parking: "2 Car",
    furnishing: "Semi-Furnished",
    availableTimeSlots: ["Morning", "Afternoon", "Evening"],
    amenities: ["Garden", "Terrace", "Security", "Power Backup"],
    contactPerson: "Sunita Reddy",
    contactPhone: "9876543213",
    contactEmail: "sunita@example.com",
    whatsappNumber: "9876543213",
    businessName: "Reddy Properties",
    businessAddress: "Jayanagar, Bangalore",
    commissionPercentage: 1.5,
    isVerified: true,
    status: "active"
  },

  // FURNITURE
  {
    title: "L-Shaped Sofa Set - Premium Quality",
    description: "Beautiful L-shaped sofa set in excellent condition. Comfortable seating for 6 people. Fabric upholstery.",
    category: "furniture",
    subCategory: "Sofa",
    price: 35000,
    priceType: "negotiable",
    location: "Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
    brand: "Urban Ladder",
    model: "Barcelona L-Shaped Sofa",
    condition: "like_new",
    warranty: "6 months",
    quantity: 1,
    unit: "Set",
    year: "2023",
    contactPerson: "Vikram Singh",
    contactPhone: "9876543214",
    contactEmail: "vikram@example.com",
    whatsappNumber: "9876543214",
    businessName: "Singh Furniture",
    businessAddress: "Indiranagar, Bangalore",
    isVerified: true,
    status: "active"
  },
  {
    title: "King Size Bed with Mattress",
    description: "Solid wood king size bed with premium mattress. Excellent condition, barely used.",
    category: "furniture",
    subCategory: "Bed",
    price: 28000,
    priceType: "fixed",
    location: "Malleshwaram",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560003",
    brand: "Godrej Interio",
    model: "Engineered Wood King Bed",
    condition: "good",
    warranty: "1 year",
    quantity: 1,
    unit: "Set",
    year: "2022",
    contactPerson: "Meera Joshi",
    contactPhone: "9876543215",
    contactEmail: "meera@example.com",
    whatsappNumber: "9876543215",
    businessName: "Joshi Furniture Store",
    businessAddress: "Malleshwaram, Bangalore",
    isVerified: true,
    status: "active"
  },

  // SERVICES
  {
    title: "Professional Plumbing Services",
    description: "Expert plumbing services for residential and commercial properties. 24/7 emergency service available.",
    category: "services",
    subCategory: "Plumbing",
    serviceType: "Plumbing",
    minPrice: 500,
    maxPrice: 5000,
    priceType: "project_based",
    location: "All Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    experience: "8 years",
    availability: "24/7",
    serviceArea: "Bangalore",
    servicePackage: "Monthly",
    certifications: "Licensed Plumber, Certified in Modern Plumbing Systems",
    languages: "English, Hindi, Kannada",
    contactPerson: "Ravi Kumar",
    contactPhone: "9876543216",
    contactEmail: "ravi.plumber@example.com",
    whatsappNumber: "9876543216",
    businessName: "Kumar Plumbing Services",
    businessAddress: "Rajajinagar, Bangalore",
    isVerified: true,
    status: "active"
  },
  {
    title: "Home Cleaning & Maintenance",
    description: "Professional home cleaning services including deep cleaning, regular maintenance, and sanitization.",
    category: "services",
    subCategory: "Cleaning",
    serviceType: "Cleaning",
    minPrice: 800,
    maxPrice: 3000,
    priceType: "per_unit",
    location: "South Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560076",
    experience: "5 years",
    availability: "Mon-Sat 8AM-6PM",
    serviceArea: "South Bangalore",
    servicePackage: "Weekly",
    certifications: "Trained in Professional Cleaning, COVID-19 Safety Protocols",
    languages: "English, Hindi, Tamil",
    contactPerson: "Lakshmi Devi",
    contactPhone: "9876543217",
    contactEmail: "lakshmi.cleaning@example.com",
    whatsappNumber: "9876543217",
    businessName: "Devi Cleaning Services",
    businessAddress: "BTM Layout, Bangalore",
    isVerified: true,
    status: "active"
  },

  // MATERIALS (Building Materials)
  {
    title: "Premium Quality Cement - ACC Brand",
    description: "High-grade cement suitable for all construction needs. Fresh stock available in bulk quantities.",
    category: "materials",
    subCategory: "Cement",
    price: 380,
    priceType: "per_unit",
    location: "Peenya Industrial Area",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560058",
    brand: "ACC",
    model: "OPC 53 Grade",
    condition: "new",
    quantity: 500,
    unit: "Bags (50kg each)",
    year: "2024",
    contactPerson: "Suresh Gupta",
    contactPhone: "9876543218",
    contactEmail: "suresh.materials@example.com",
    whatsappNumber: "9876543218",
    businessName: "Gupta Building Materials",
    businessAddress: "Peenya Industrial Area, Bangalore",
    isVerified: true,
    status: "active"
  },
  {
    title: "Steel TMT Bars - TATA Brand",
    description: "High tensile strength TMT bars for construction. Available in various sizes. Certified quality.",
    category: "materials",
    subCategory: "Steel",
    price: 65000,
    priceType: "per_unit",
    location: "Bommanahalli",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560068",
    brand: "TATA Steel",
    model: "TMT Fe 500D",
    condition: "new",
    quantity: 10,
    unit: "Tonnes",
    year: "2024",
    contactPerson: "Ramesh Yadav",
    contactPhone: "9876543219",
    contactEmail: "ramesh.steel@example.com",
    whatsappNumber: "9876543219",
    businessName: "Yadav Steel Corporation",
    businessAddress: "Bommanahalli, Bangalore",
    isVerified: true,
    status: "active"
  }
];

async function createSampleListings() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get or create a user for listings
    let user = await User.findOne({ where: { email: 'testuser@example.com' } });
    
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: '$2a$10$example.hash.here', // This is just a placeholder
        phone: '9876543200',
        isVerified: true
      });
      console.log('✅ Created test user');
    }

    // Clear existing sample listings
    await Listing.destroy({ 
      where: { 
        title: {
          [require('sequelize').Op.in]: sampleListings.map(l => l.title)
        }
      } 
    });
    console.log('🧹 Cleared existing sample listings');

    // Create new listings
    for (const listingData of sampleListings) {
      const listing = await Listing.create({
        ...listingData,
        userId: user.id,
        images: [
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
        ]
      });
      console.log(`✅ Created listing: ${listing.title}`);
    }

    console.log('\n🎉 Sample listings created successfully!');
    console.log('\n📊 Summary:');
    console.log('- Property Sell: 2 listings');
    console.log('- Property Rent: 2 listings');
    console.log('- Furniture: 2 listings');
    console.log('- Services: 2 listings');
    console.log('- Materials: 2 listings');
    console.log('\n🌐 You can now test reviews and messages on these listings!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample listings:', error);
    process.exit(1);
  }
}

createSampleListings();