const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function interactiveVendorCreation() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.\n');

    console.log('🏪 VENDOR CREDENTIAL CREATOR');
    console.log('═══════════════════════════════════════\n');

    // Collect vendor information
    const email = await askQuestion('📧 Enter vendor email: ');
    const password = await askQuestion('🔑 Enter vendor password (min 6 chars): ');
    const name = await askQuestion('👤 Enter vendor name: ');
    const businessName = await askQuestion('🏢 Enter business name: ');
    const phone = await askQuestion('📱 Enter phone number: ');
    
    console.log('\n📍 Location Information:');
    const city = await askQuestion('🏙️  Enter city: ');
    const locality = await askQuestion('📍 Enter locality: ');
    const state = await askQuestion('🗺️  Enter state: ');
    const pincode = await askQuestion('📮 Enter pincode: ');
    
    console.log('\n🏪 Business Information:');
    console.log('Vendor Types: 1) building_materials  2) home_services');
    const vendorTypeChoice = await askQuestion('Choose vendor type (1 or 2): ');
    const vendorType = vendorTypeChoice === '1' ? 'building_materials' : 'home_services';
    
    const categoriesInput = await askQuestion('📦 Enter categories (comma-separated): ');
    const categories = categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat);
    
    const description = await askQuestion('📝 Enter business description: ');

    rl.close();

    // Validate required fields
    if (!email || !password || !name || !businessName || !city || !locality) {
      console.log('❌ Error: All required fields must be filled');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    console.log('\n🔄 Creating vendor credentials...');

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      console.log('ℹ️  User already exists, linking to vendor profile');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || '0000000000',
        role: 'user',
        isVerified: true
      });
      console.log('✅ User account created');
    }

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ where: { userId: user.id } });
    
    if (existingVendor) {
      console.log('⚠️  Vendor profile already exists for this user');
      console.log(`Existing Vendor: ${existingVendor.businessName}`);
      process.exit(0);
    }

    // Create vendor profile
    const vendor = await Vendor.create({
      businessName,
      contactPerson: name,
      contactPhone: phone || '0000000000',
      contactEmail: email,
      whatsappNumber: phone || '0000000000',
      businessAddress: `${locality}, ${city}, ${state} - ${pincode}`,
      vendorType,
      categories,
      description: description || `Professional ${vendorType.replace('_', ' ')} services`,
      experience: '1+ years',
      serviceArea: city,
      city,
      locality,
      state,
      pincode,
      minPrice: 1000.00,
      maxPrice: 50000.00,
      priceType: 'project_based',
      languages: 'English',
      availability: 'Mon-Sat 9AM-6PM',
      images: [],
      documents: [],
      isVerified: false,
      isActive: true,
      isFeatured: false,
      userId: user.id
    });

    console.log('\n🎉 Vendor credentials created successfully!');
    console.log('\n📊 VENDOR DETAILS:');
    console.log('═══════════════════════════════════════');
    console.log(`👤 User ID: ${user.id}`);
    console.log(`🏢 Vendor ID: ${vendor.id}`);
    console.log(`📧 Login Email: ${email}`);
    console.log(`🔑 Login Password: ${password}`);
    console.log(`🏪 Business Name: ${businessName}`);
    console.log(`📍 Location: ${city}, ${locality}`);
    console.log(`🏷️  Type: ${vendorType}`);
    console.log(`📦 Categories: ${categories.join(', ')}`);
    console.log(`✅ Status: Active`);
    console.log(`🔒 Verified: No (Admin needs to verify)`);
    console.log('═══════════════════════════════════════');

    console.log('\n🔗 Next Steps:');
    console.log('1. Go to vendor portal login page');
    console.log('2. Login with the email and password above');
    console.log('3. Ask admin to verify the vendor profile');
    console.log(`4. Portal URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

interactiveVendorCreation();