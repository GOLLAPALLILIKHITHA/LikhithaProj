const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    const testUserData = {
      email: 'testuser@example.com',
      password: 'Test@123',
      name: 'Test User',
      phone: '9876543210'
    };

    console.log('\n👤 Creating test user...');
    console.log(`Email: ${testUserData.email}`);
    console.log(`Password: ${testUserData.password}`);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: testUserData.email } });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists');
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Name: ${existingUser.name}`);
      console.log(`Email: ${existingUser.email}`);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(testUserData.password, 10);
      const user = await User.create({
        name: testUserData.name,
        email: testUserData.email,
        password: hashedPassword,
        phone: testUserData.phone,
        role: 'user',
        isVerified: true
      });

      console.log('✅ Test user created successfully!');
      console.log(`User ID: ${user.id}`);
    }

    console.log('\n🔗 Login Instructions:');
    console.log('1. Go to: http://localhost:5173/login');
    console.log(`2. Email: ${testUserData.email}`);
    console.log(`3. Password: ${testUserData.password}`);
    console.log('4. After login, go to: http://localhost:5173/services');
    console.log('5. Try submitting a service request');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();