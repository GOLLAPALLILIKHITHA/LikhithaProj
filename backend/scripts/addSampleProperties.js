const { Sequelize } = require('sequelize');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const BuyRequest = require('../src/models/BuyRequest');

async function addSampleProperties() {
  try {
    console.log('🏠 Adding sample properties for Owner Management...');

    // Create sample users (property owners)
    const owner1 = await User.findOrCreate({
      where: { email: 'owner1@example.com' },
      defaults: {
        name: 'Rajesh Kumar',
        email: 'owner1@example.com',
        phone: '+91 9876543210',
        password: 'password123',
        isVerified: true
      }
    });

    const owner2 = await User.findOrCreate({
      where: { email: 'owner2@example.com' },
      defaults: {
        name: 'Priya Sharma',
        email: 'owner2@example.com',
        phone: '+91 9876543211',
        password: 'password123',
        isVerified: true
      }
    });

    const buyer1 = await User.findOrCreate({
      where: { email: 'buyer1@example.com' },
      defaults: {
        name: 'Amit Singh',
        email: 'buyer1@example.com',
        phone: '+91 9876543212',
        password: 'password123',
        isVerified: true
      }
    });

    // Create sample properties
    const property1 = await Listing.create({
      title: '3BHK Luxury Apartment in Banjara Hills',
      description: 'Beautiful 3BHK apartment with modern amenities, parking, and great city view.',
      category: 'property_sell',
      subCategory: 'Apartment',
      price: 8500000,
      priceType: 'fixed',
      location: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      bedrooms: 3,
      bathrooms: 2,
      area: 1450,
      areaUnit: 'sqft',
      propertyAge: '2 years',
      facing: 'East',
      floor: 5,
      totalFloors: 12,
      parking: '2 Car',
      furnishing: 'semi-furnished',
      commissionPercentage: 2.5,
      amenities: ['Parking', 'Lift', 'Security', 'Power Backup', 'Gym', 'Swimming Pool'],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
      ],
      ownerDocuments: [
        {
          url: 'https://example.com/doc1.pdf',
          originalName: 'property_papers.pdf',
          uploadedAt: new Date()
        }
      ],
      thalukaDocuments: [
        {
          url: 'https://example.com/thaluka1.pdf',
          originalName: 'thaluka_certificate.pdf',
          uploadedAt: new Date()
        }
      ],
      contactPerson: 'Rajesh Kumar',
      contactPhone: '+91 9876543210',
      contactEmail: 'owner1@example.com',
      businessName: 'Kumar Properties',
      businessAddress: 'Road No 12, Banjara Hills, Hyderabad',
      ownerBankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        accountHolderName: 'Rajesh Kumar'
      },
      ownerAadhaar: '1234-5678-9012',
      ownerPan: 'ABCDE1234F',
      status: 'active',
      isVerified: true,
      isFeatured: true,
      userId: owner1[0].id
    });

    const property2 = await Listing.create({
      title: '2BHK Villa in Jubilee Hills',
      description: 'Spacious 2BHK villa with garden, perfect for families.',
      category: 'property_sell',
      subCategory: 'Villa',
      price: 12000000,
      priceType: 'negotiable',
      location: 'Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      bedrooms: 2,
      bathrooms: 2,
      area: 1800,
      areaUnit: 'sqft',
      propertyAge: 'New',
      facing: 'North',
      floor: 1,
      totalFloors: 2,
      parking: '3 Car',
      furnishing: 'furnished',
      commissionPercentage: 3.0,
      amenities: ['Parking', 'Garden', 'Security', 'Power Backup'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
      ],
      ownerDocuments: [
        {
          url: 'https://example.com/doc2.pdf',
          originalName: 'villa_documents.pdf',
          uploadedAt: new Date()
        }
      ],
      thalukaDocuments: [
        {
          url: 'https://example.com/thaluka2.pdf',
          originalName: 'land_records.pdf',
          uploadedAt: new Date()
        }
      ],
      contactPerson: 'Priya Sharma',
      contactPhone: '+91 9876543211',
      contactEmail: 'owner2@example.com',
      businessName: 'Sharma Realty',
      businessAddress: 'Plot 45, Jubilee Hills, Hyderabad',
      ownerBankDetails: {
        accountNumber: '0987654321',
        ifscCode: 'ICICI0001234',
        bankName: 'ICICI Bank',
        accountHolderName: 'Priya Sharma'
      },
      ownerAadhaar: '9876-5432-1098',
      ownerPan: 'FGHIJ5678K',
      status: 'sold',
      isVerified: true,
      isFeatured: false,
      userId: owner2[0].id
    });

    // Create a buy request for the sold property
    const buyRequest = await BuyRequest.create({
      userId: buyer1[0].id,
      listingId: property2.id,
      status: 'completed',
      buyerMessage: 'I am very interested in purchasing this villa. Please proceed with the paperwork.',
      adminNotes: 'Buyer verified and payment confirmed. Sale completed successfully.',
      agreementDocuments: [
        {
          url: 'https://example.com/agreement.pdf',
          originalName: 'sale_agreement.pdf',
          uploadedAt: new Date()
        }
      ],
      approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
    });

    // Create one more active property
    const property3 = await Listing.create({
      title: '4BHK Penthouse in HITEC City',
      description: 'Luxurious penthouse with terrace garden and premium amenities.',
      category: 'property_sell',
      subCategory: 'Apartment',
      price: 15000000,
      priceType: 'fixed',
      location: 'HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      bedrooms: 4,
      bathrooms: 3,
      area: 2200,
      areaUnit: 'sqft',
      propertyAge: '1 year',
      facing: 'South',
      floor: 15,
      totalFloors: 15,
      parking: '3 Car',
      furnishing: 'furnished',
      commissionPercentage: 2.0,
      amenities: ['Parking', 'Lift', 'Security', 'Power Backup', 'Gym', 'Swimming Pool', 'Club House', 'Terrace'],
      images: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
      ],
      ownerDocuments: [
        {
          url: 'https://example.com/doc3.pdf',
          originalName: 'penthouse_papers.pdf',
          uploadedAt: new Date()
        }
      ],
      thalukaDocuments: [],
      contactPerson: 'Rajesh Kumar',
      contactPhone: '+91 9876543210',
      contactEmail: 'owner1@example.com',
      businessName: 'Kumar Properties',
      businessAddress: 'Road No 12, Banjara Hills, Hyderabad',
      ownerBankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        accountHolderName: 'Rajesh Kumar'
      },
      status: 'active',
      isVerified: true,
      isFeatured: true,
      userId: owner1[0].id
    });

    console.log('✅ Sample properties added successfully!');
    console.log(`📊 Created properties:`);
    console.log(`   - ${property1.title} (ACTIVE)`);
    console.log(`   - ${property2.title} (SOLD to ${buyer1[0].name})`);
    console.log(`   - ${property3.title} (ACTIVE)`);
    console.log('');
    console.log('🎯 Now visit http://localhost:5173/admin/owners to see the Owner Management page with data!');

  } catch (error) {
    console.error('❌ Error adding sample properties:', error);
  }
}

// Run the script
addSampleProperties();