const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');

/**
 * Create vendor credentials script
 * This script creates a vendor account with login credentials
 */

async function createVendorCredentials() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Vendor details - Modify these as needed
    const vendorData = {
      // Login credentials
      email: 'vendor@example.com',
      password: 'Vendor@123',
      name: 'Vendor Name',
      phone: '9876543210',
      
      // Business details
      businessName: 'Sample Vendor Business',
      contactPerson: 'Contact Person Name',
      contactPhone: '9876543210',
      contactEmail: 'vendor@example.com',
      whatsappNumber: '9876543210',
      businessAddress: '123 Business Street, City',
      
      // Vendor type: 'building_materials' or 'home_services'
      vendorType: 'building_materials',
      
      // Categories (array of strings)
      categories: ['Cement', 'Bricks', 'Sand'],
      
      // Business info
      description: 'Professional vendor providing quality services',
      experience: '5 years',
      serviceArea: 'City Area',
      city: 'Bangalore',
      locality: 'Whitefield',
      state: 'Karnataka',
      pincode: '560066',
      
      // Pricing
      minPrice: 1000.00,
      maxPrice: 50000.00,
      priceType: 'per_unit', // 'hourly', 'project_based', 'per_unit', 'per_kg', 'per_sqft', 'fixed'
      
      // Additional info
      certifications: 'ISO 9001',
      languages: 'English, Hindi',
      availability: 'Mon-Sat 9AM-6PM',
      
      // Status
      isVerified: false,
      isActive: true,
      isFeatured: false
    };

    console.log('\n📋 Creating vendor with the following details:');
    console.log(`Email: ${vendorData.email}`);
    console.log(`Business Name: ${vendorData.businessName}`);
    console.log(`Vendor Type: ${vendorData.vendorType}`);
    console.log(`City: ${vendorData.city}`);

    // Check if user already exists
    let user = await User.findOne({ where: { email: vendorData.email } });
    let userCreated = false;

    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(vendorData.password, 10);
      user = await User.create({
        name: vendorData.name,
        email: vendorData.email,
        password: hashedPassword,
        phone: vendorData.phone,
        role: 'user',
        isVerified: true
      });
      userCreated = true;
      console.log('✅ User account created successfully');
    } else {
      console.log('ℹ️  User account already exists, linking to vendor profile');
    }

    // Check if vendor profile already exists for this user
    const existingVendor = await Vendor.findOne({
      where: { userId: user.id }
    });

    if (existingVendor) {
      console.log('⚠️  Vendor profile already exists for this user');
      console.log(`Existing Vendor ID: ${existingVendor.id}`);
      console.log(`Business Name: ${existingVendor.businessName}`);
      
      // Ask if user wants to update
      console.log('\n🔄 To update existing vendor, modify the script or delete the existing vendor first');
      return;
    }

    // Create vendor profile
    const vendor = await Vendor.create({
      businessName: vendorData.businessName,
      contactPerson: vendorData.contactPerson,
      contactPhone: vendorData.contactPhone,
      contactEmail: vendorData.contactEmail,
      whatsappNumber: vendorData.whatsappNumber,
      businessAddress: vendorData.businessAddress,
      vendorType: vendorData.vendorType,
      categories: vendorData.categories,
      description: vendorData.description,
      experience: vendorData.experience,
      serviceArea: vendorData.serviceArea,
      city: vendorData.city,
      locality: vendorData.locality,
      state: vendorData.state,
      pincode: vendorData.pincode,
      minPrice: vendorData.minPrice,
      maxPrice: vendorData.maxPrice,
      priceType: vendorData.priceType,
      certifications: vendorData.certifications,
      languages: vendorData.languages,
      availability: vendorData.availability,
      images: [],
      documents: [],
      isVerified: vendorData.isVerified,
      isActive: vendorData.isActive,
      isFeatured: vendorData.isFeatured,
      userId: user.id
    });

    console.log('\n🎉 Vendor credentials created successfully!');
    console.log('\n📊 Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`👤 User ID: ${user.id}`);
    console.log(`🏢 Vendor ID: ${vendor.id}`);
    console.log(`📧 Login Email: ${vendorData.email}`);
    console.log(`🔑 Login Password: ${vendorData.password}`);
    console.log(`🏪 Business Name: ${vendorData.businessName}`);
    console.log(`📍 Location: ${vendorData.city}, ${vendorData.locality}`);
    console.log(`✅ Status: ${vendor.isActive ? 'Active' : 'Inactive'}`);
    console.log(`🔒 Verified: ${vendor.isVerified ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════');

    // Generate login token for testing
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n🔗 Vendor Portal Access:');
    console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor/login`);
    console.log(`API Login Endpoint: ${process.env.API_URL || 'http://localhost:3000'}/api/auth/login`);
    console.log('\n📝 Login Instructions:');
    console.log('1. Go to the vendor portal login page');
    console.log('2. Enter the email and password shown above');
    console.log('3. You should be logged in as a vendor');

    if (!vendor.isVerified) {
      console.log('\n⚠️  Note: Vendor is not verified. Admin needs to verify the vendor profile.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating vendor credentials:', error);
    process.exit(1);
  }
}

// Helper function to create multiple vendors
async function createMultipleVendors() {
  const vendors = [
    {
      email: 'materials.vendor@example.com',
      password: 'Materials@123',
      name: 'Materials Vendor',
      businessName: 'Premium Building Materials',
      vendorType: 'building_materials',
      categories: ['Cement', 'Steel', 'Bricks'],
      city: 'Mumbai',
      locality: 'Andheri'
    },
    {
      email: 'services.vendor@example.com',
      password: 'Services@123',
      name: 'Services Vendor',
      businessName: 'Home Services Pro',
      vendorType: 'home_services',
      categories: ['Plumbing', 'Electrical', 'Carpentry'],
      city: 'Delhi',
      locality: 'Connaught Place'
    }
  ];

  console.log('Creating multiple vendors...\n');
  
  for (const vendorData of vendors) {
    try {
      // Create user
      const hashedPassword = await bcrypt.hash(vendorData.password, 10);
      const [user, userCreated] = await User.findOrCreate({
        where: { email: vendorData.email },
        defaults: {
          name: vendorData.name,
          email: vendorData.email,
          password: hashedPassword,
          phone: '9876543210',
          role: 'user',
          isVerified: true
        }
      });

      // Create vendor
      const [vendor, vendorCreated] = await Vendor.findOrCreate({
        where: { userId: user.id },
        defaults: {
          businessName: vendorData.businessName,
          contactPerson: vendorData.name,
          contactPhone: '9876543210',
          contactEmail: vendorData.email,
          businessAddress: `123 ${vendorData.locality}, ${vendorData.city}`,
          vendorType: vendorData.vendorType,
          categories: vendorData.categories,
          description: `Professional ${vendorData.vendorType.replace('_', ' ')} vendor`,
          city: vendorData.city,
          locality: vendorData.locality,
          state: 'State',
          pincode: '123456',
          isActive: true,
          userId: user.id
        }
      });

      if (vendorCreated) {
        console.log(`✅ Created: ${vendorData.businessName} (${vendorData.email})`);
      } else {
        console.log(`ℹ️  Exists: ${vendorData.businessName} (${vendorData.email})`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${vendorData.businessName}:`, error.message);
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--multiple')) {
  createMultipleVendors();
} else {
  createVendorCredentials();
}