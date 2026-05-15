const sequelize = require('../src/config/database');
const Listing = require('../src/models/Listing');
const User = require('../src/models/User');

async function addSampleFilterListings() {
  try {
    console.log('🔄 Adding sample listings with enhanced filter fields...');
    
    // Find or create a sample user
    let sampleUser = await User.findOne({ where: { email: 'seller@example.com' } });
    if (!sampleUser) {
      sampleUser = await User.create({
        name: 'Sample Seller',
        email: 'seller@example.com',
        password: 'hashedpassword',
        phone: '9876543210',
        isVerified: true
      });
    }

    // Sample Furniture Listings
    const furnitureListings = [
      {
        title: 'Modern L-Shaped Sofa Set',
        description: 'Comfortable 6-seater L-shaped sofa in excellent condition. Perfect for living room.',
        category: 'furniture',
        subCategory: 'Sofa & Seating',
        price: 25000,
        priceType: 'negotiable',
        location: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        brand: 'Urban Ladder',
        condition: 'like_new',
        warranty: '2 years remaining',
        images: ['https://via.placeholder.com/400x300?text=L-Shaped+Sofa'],
        userId: sampleUser.id
      },
      {
        title: 'Wooden Dining Table with 4 Chairs',
        description: 'Solid wood dining table set in good condition. Minor scratches but very sturdy.',
        category: 'furniture',
        subCategory: 'Dining Tables',
        price: 15000,
        priceType: 'fixed',
        location: 'Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560038',
        brand: 'Godrej',
        condition: 'good',
        warranty: 'No warranty',
        images: ['https://via.placeholder.com/400x300?text=Dining+Table'],
        userId: sampleUser.id
      },
      {
        title: 'King Size Bed with Mattress',
        description: 'Brand new king size bed with premium mattress. Never used.',
        category: 'furniture',
        subCategory: 'Beds & Mattresses',
        price: 35000,
        priceType: 'fixed',
        location: 'Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        brand: 'IKEA',
        condition: 'new',
        warranty: '5 years',
        images: ['https://via.placeholder.com/400x300?text=King+Size+Bed'],
        userId: sampleUser.id
      }
    ];

    // Sample Electronics Listings
    const electronicsListings = [
      {
        title: '55" 4K Smart LED TV',
        description: 'Samsung 55-inch 4K Smart TV in excellent condition. All accessories included.',
        category: 'electronics',
        subCategory: 'TV',
        price: 45000,
        priceType: 'negotiable',
        location: 'HSR Layout',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560102',
        brand: 'Samsung',
        condition: 'like_new',
        warranty: '1 year remaining',
        images: ['https://via.placeholder.com/400x300?text=Samsung+TV'],
        userId: sampleUser.id
      },
      {
        title: 'Double Door Refrigerator 300L',
        description: 'LG double door refrigerator in working condition. Some minor dents but functions perfectly.',
        category: 'electronics',
        subCategory: 'Refrigerator',
        price: 18000,
        priceType: 'negotiable',
        location: 'Marathahalli',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560037',
        brand: 'LG',
        condition: 'good',
        warranty: 'No warranty',
        images: ['https://via.placeholder.com/400x300?text=LG+Refrigerator'],
        userId: sampleUser.id
      },
      {
        title: 'Front Load Washing Machine 7kg',
        description: 'Bosch front load washing machine, barely used. Excellent condition with all features working.',
        category: 'electronics',
        subCategory: 'Washing Machine',
        price: 28000,
        priceType: 'fixed',
        location: 'Electronic City',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560100',
        brand: 'Bosch',
        condition: 'like_new',
        warranty: '3 years remaining',
        images: ['https://via.placeholder.com/400x300?text=Bosch+Washing+Machine'],
        userId: sampleUser.id
      }
    ];

    // Sample Services Listings
    const servicesListings = [
      {
        title: 'Professional Home Cleaning Service',
        description: 'Experienced home cleaning service with trained staff. Available for regular and deep cleaning.',
        category: 'services',
        subCategory: 'Home Cleaning',
        price: 500,
        priceType: 'hourly',
        location: 'All Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        availability: 'immediate',
        experience: '5+ years',
        serviceArea: 'Bangalore',
        contactPerson: 'Cleaning Pro Services',
        contactPhone: '9876543210',
        images: ['https://via.placeholder.com/400x300?text=Home+Cleaning'],
        userId: sampleUser.id
      },
      {
        title: 'Expert Plumbing Services',
        description: 'Licensed plumber available for all types of plumbing work. Emergency services available.',
        category: 'services',
        subCategory: 'Plumbing',
        price: 800,
        priceType: 'hourly',
        location: 'Central Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        availability: 'emergency',
        experience: '10+ years',
        serviceArea: 'Bangalore',
        contactPerson: 'Master Plumber',
        contactPhone: '9876543211',
        images: ['https://via.placeholder.com/400x300?text=Plumbing+Service'],
        userId: sampleUser.id
      },
      {
        title: 'AC Repair and Maintenance',
        description: 'Certified AC technician for repair and maintenance of all AC brands. Weekend service available.',
        category: 'services',
        subCategory: 'AC Repair & Service',
        price: 600,
        priceType: 'project_based',
        location: 'South Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        availability: 'weekend',
        experience: '8+ years',
        serviceArea: 'South Bangalore',
        contactPerson: 'Cool Air Services',
        contactPhone: '9876543212',
        images: ['https://via.placeholder.com/400x300?text=AC+Repair'],
        userId: sampleUser.id
      }
    ];

    // Sample Materials Listings
    const materialsListings = [
      {
        title: 'Premium Quality Cement - 50kg Bags',
        description: 'High-grade cement suitable for all construction needs. ISI marked and certified.',
        category: 'materials',
        subCategory: 'Cement & Concrete',
        price: 350,
        priceType: 'per_unit',
        location: 'Whitefield',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        materialType: 'Premium Quality',
        quantity: 100,
        unit: 'bags',
        images: ['https://via.placeholder.com/400x300?text=Premium+Cement'],
        userId: sampleUser.id
      },
      {
        title: 'ISI Marked Steel Rods - TMT Bars',
        description: 'High tensile strength TMT bars for construction. Available in various sizes.',
        category: 'materials',
        subCategory: 'Steel & Iron Rods',
        price: 55000,
        priceType: 'per_unit',
        location: 'Peenya',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560058',
        materialType: 'ISI Marked',
        quantity: 50,
        unit: 'tonnes',
        images: ['https://via.placeholder.com/400x300?text=TMT+Steel+Rods'],
        userId: sampleUser.id
      },
      {
        title: 'Standard Quality Red Bricks',
        description: 'Good quality red bricks for construction. Uniform size and shape.',
        category: 'materials',
        subCategory: 'Bricks & Blocks',
        price: 8,
        priceType: 'per_unit',
        location: 'Yelahanka',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560064',
        materialType: 'Standard Quality',
        quantity: 10000,
        unit: 'pieces',
        images: ['https://via.placeholder.com/400x300?text=Red+Bricks'],
        userId: sampleUser.id
      },
      {
        title: 'Certified River Sand - Construction Grade',
        description: 'Clean river sand suitable for construction and plastering work.',
        category: 'materials',
        subCategory: 'Sand & Gravel',
        price: 1200,
        priceType: 'per_unit',
        location: 'Sarjapur',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560035',
        materialType: 'Certified',
        quantity: 20,
        unit: 'loads',
        images: ['https://via.placeholder.com/400x300?text=River+Sand'],
        userId: sampleUser.id
      }
    ];

    // Insert all listings
    const allListings = [
      ...furnitureListings,
      ...electronicsListings,
      ...servicesListings,
      ...materialsListings
    ];

    for (const listingData of allListings) {
      await Listing.create(listingData);
      console.log(`✅ Created listing: ${listingData.title}`);
    }

    console.log(`🎉 Successfully created ${allListings.length} sample listings with enhanced filter fields!`);
    
  } catch (error) {
    console.error('❌ Error creating sample listings:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
addSampleFilterListings()
  .then(() => {
    console.log('🎉 Sample listings creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Sample listings creation failed:', error);
    process.exit(1);
  });