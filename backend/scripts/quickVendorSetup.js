const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');

/**
 * Quick Vendor Setup Script
 * Creates common vendor types with predefined data
 */

const VENDOR_TEMPLATES = {
  materials: {
    email: 'materials@vendor.com',
    password: 'Materials@123',
    name: 'Materials Vendor',
    businessName: 'Premium Building Materials',
    vendorType: 'building_materials',
    categories: ['Cement', 'Steel', 'Bricks', 'Sand', 'Aggregates'],
    description: 'Quality building materials supplier for construction projects',
    city: 'Bangalore',
    locality: 'Whitefield'
  },
  plumber: {
    email: 'plumber@vendor.com',
    password: 'Plumber@123',
    name: 'Plumber Service',
    businessName: 'Expert Plumbing Services',
    vendorType: 'home_services',
    categories: ['Plumbing', 'Pipe Repair', 'Bathroom Fitting'],
    description: 'Professional plumbing services for residential and commercial properties',
    city: 'Mumbai',
    locality: 'Andheri'
  },
  electrician: {
    email: 'electrician@vendor.com',
    password: 'Electric@123',
    name: 'Electrical Service',
    businessName: 'PowerFix Electrical Services',
    vendorType: 'home_services',
    categories: ['Electrical', 'Wiring', 'Appliance Repair'],
    description: 'Licensed electrical services for homes and offices',
    city: 'Delhi',
    locality: 'Connaught Place'
  },
  carpenter: {
    email: 'carpenter@vendor.com',
    password: 'Carpenter@123',
    name: 'Carpentry Service',
    businessName: 'WoodCraft Carpentry',
    vendorType: 'home_services',
    categories: ['Carpentry', 'Furniture', 'Wood Work'],
    description: 'Custom carpentry and furniture services',
    city: 'Chennai',
    locality: 'T Nagar'
  },
  painter: {
    email: 'painter@vendor.com',
    password: 'Painter@123',
    name: 'Painting Service',
    businessName: 'ColorPro Painting Services',
    vendorType: 'home_services',
    categories: ['Painting', 'Wall Painting', 'Interior Design'],
    description: 'Professional painting services for interior and exterior',
    city: 'Pune',
    locality: 'Koregaon Park'
  }
};

async function createVendorFromTemplate(templateKey) {
  const template = VENDOR_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template '${templateKey}' not found`);
  }

  console.log(`\n🔄 Creating ${template.businessName}...`);

  // Create or find user
  const hashedPassword = await bcrypt.hash(template.password, 10);
  const [user, userCreated] = await User.findOrCreate({
    where: { email: template.email },
    defaults: {
      name: template.name,
      email: template.email,
      password: hashedPassword,
      phone: '9876543210',
      role: 'user',
      isVerified: true
    }
  });

  if (!userCreated) {
    console.log(`ℹ️  User already exists: ${template.email}`);
  }

  // Check if vendor exists
  const existingVendor = await Vendor.findOne({ where: { userId: user.id } });
  
  if (existingVendor) {
    console.log(`⚠️  Vendor already exists: ${existingVendor.businessName}`);
    return { user, vendor: existingVendor, created: false };
  }

  // Create vendor
  const vendor = await Vendor.create({
    businessName: template.businessName,
    contactPerson: template.name,
    contactPhone: '9876543210',
    contactEmail: template.email,
    whatsappNumber: '9876543210',
    businessAddress: `123 ${template.locality}, ${template.city}`,
    vendorType: template.vendorType,
    categories: template.categories,
    description: template.description,
    experience: '5+ years',
    serviceArea: template.city,
    city: template.city,
    locality: template.locality,
    state: 'State',
    pincode: '560001',
    minPrice: 500.00,
    maxPrice: 25000.00,
    priceType: template.vendorType === 'building_materials' ? 'per_unit' : 'project_based',
    certifications: 'Licensed and Insured',
    languages: 'English, Hindi',
    availability: 'Mon-Sat 9AM-7PM',
    images: [],
    documents: [],
    isVerified: false,
    isActive: true,
    isFeatured: false,
    userId: user.id
  });

  console.log(`✅ Created: ${template.businessName}`);
  return { user, vendor, created: true };
}

async function quickSetup() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    console.log('\n🚀 QUICK VENDOR SETUP');
    console.log('═══════════════════════════════════════');

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('\n📋 Available vendor templates:');
      console.log('─────────────────────────────────────');
      Object.keys(VENDOR_TEMPLATES).forEach(key => {
        const template = VENDOR_TEMPLATES[key];
        console.log(`${key.padEnd(12)} - ${template.businessName} (${template.vendorType})`);
      });
      console.log('\n💡 Usage:');
      console.log('  node quickVendorSetup.js <template_name>');
      console.log('  node quickVendorSetup.js all');
      console.log('\n📝 Examples:');
      console.log('  node quickVendorSetup.js materials');
      console.log('  node quickVendorSetup.js plumber');
      console.log('  node quickVendorSetup.js all');
      process.exit(0);
    }

    const templateName = args[0].toLowerCase();

    if (templateName === 'all') {
      console.log('\n🔄 Creating all vendor templates...');
      const results = [];
      
      for (const key of Object.keys(VENDOR_TEMPLATES)) {
        try {
          const result = await createVendorFromTemplate(key);
          results.push({ key, ...result });
        } catch (error) {
          console.error(`❌ Error creating ${key}:`, error.message);
        }
      }

      console.log('\n📊 SUMMARY:');
      console.log('═══════════════════════════════════════');
      results.forEach(({ key, user, vendor, created }) => {
        const template = VENDOR_TEMPLATES[key];
        console.log(`${created ? '✅' : 'ℹ️ '} ${template.businessName}`);
        console.log(`   📧 Email: ${template.email}`);
        console.log(`   🔑 Password: ${template.password}`);
        console.log(`   🆔 Vendor ID: ${vendor.id}`);
        console.log('');
      });

    } else if (VENDOR_TEMPLATES[templateName]) {
      const result = await createVendorFromTemplate(templateName);
      const template = VENDOR_TEMPLATES[templateName];
      
      console.log('\n🎉 Vendor created successfully!');
      console.log('\n📊 VENDOR DETAILS:');
      console.log('═══════════════════════════════════════');
      console.log(`🏢 Business: ${template.businessName}`);
      console.log(`📧 Email: ${template.email}`);
      console.log(`🔑 Password: ${template.password}`);
      console.log(`🆔 Vendor ID: ${result.vendor.id}`);
      console.log(`📍 Location: ${template.city}, ${template.locality}`);
      console.log(`🏷️  Type: ${template.vendorType}`);
      console.log(`📦 Categories: ${template.categories.join(', ')}`);
      console.log('═══════════════════════════════════════');
      
    } else {
      console.log(`❌ Template '${templateName}' not found.`);
      console.log('\n📋 Available templates:', Object.keys(VENDOR_TEMPLATES).join(', '));
      process.exit(1);
    }

    console.log('\n🔗 Next Steps:');
    console.log('1. Go to vendor portal login');
    console.log('2. Use the email and password shown above');
    console.log('3. Ask admin to verify vendor profiles');
    console.log(`4. Portal: ${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickSetup();