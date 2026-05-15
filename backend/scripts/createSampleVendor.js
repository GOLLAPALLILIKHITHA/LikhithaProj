const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const vendorEmail = 'vendor1@infraall.test';
    const [user, userCreated] = await User.findOrCreate({
      where: { email: vendorEmail },
      defaults: {
        name: 'InfraAll Vendor One',
        email: vendorEmail,
        password: await bcrypt.hash('Vendor@123', 10),
        phone: '9876543210',
        role: 'user',
      },
    });

    if (!userCreated) {
      console.log(`User already exists for email ${vendorEmail}.`);
    } else {
      console.log(`Created user ${user.email}.`);
    }

    const existingVendor = await Vendor.findOne({
      where: {
        userId: user.id,
        businessName: 'InfraAll Building Materials',
      },
    });

    if (existingVendor) {
      console.log('Vendor already exists:', existingVendor.id);
      process.exit(0);
    }

    const vendor = await Vendor.create({
      businessName: 'InfraAll Building Materials',
      contactPerson: 'Vendor One',
      contactPhone: '9876543210',
      contactEmail: vendorEmail,
      whatsappNumber: '9876543210',
      businessAddress: '123 InfraAll Street, Bangalore',
      vendorType: 'building_materials',
      categories: ['Bricks', 'Cement', 'Sand'],
      description: 'Reliable building materials supplier for construction projects in Bangalore.',
      experience: '10 years',
      serviceArea: 'Bangalore',
      city: 'Bangalore',
      locality: 'Whitefield',
      state: 'Karnataka',
      pincode: '560066',
      minPrice: 1000.00,
      maxPrice: 50000.00,
      priceType: 'per_unit',
      certifications: 'ISO 9001',
      languages: 'English, Kannada',
      availability: 'Mon-Sat 9AM-7PM',
      images: [],
      documents: [],
      isVerified: false,
      isFeatured: false,
      userId: user.id,
    });

    console.log('Vendor created:', vendor.id);
    console.log('Vendor portal login email:', vendorEmail);
    console.log('Vendor portal login password:', 'Vendor@123');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create sample vendor:', error);
    process.exit(1);
  }
}

run();
