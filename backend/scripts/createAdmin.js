const bcrypt = require('bcryptjs');
require('dotenv').config();
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    await sequelize.sync();
    console.log('Database synced.');

    const adminEmail = 'sivaprasad072611@gmail.com';
    const adminPassword = 'Admin@123456'; // You can change this password
    const adminName = 'Siva Prasad';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      
      // Update existing user to admin role if not already
      if (existingAdmin.role !== 'admin') {
        await existingAdmin.update({ role: 'admin' });
        console.log('Updated existing user to admin role.');
      }
      
      console.log('Admin user details:');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      phone: '+91-9876543210', // Default phone number
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Password:', adminPassword);
    console.log('📱 Phone:', adminUser.phone);
    console.log('👑 Role:', adminUser.role);
    console.log('✅ Verified:', adminUser.isVerified);
    
    console.log('\n🚀 You can now login to admin panel with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Admin URL: http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the script
createAdminUser();