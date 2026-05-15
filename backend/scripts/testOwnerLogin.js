const axios = require('axios');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nestbazaar',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Prasad!5002',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function testOwnerLogin() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              TESTING OWNER LOGIN                               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const email = 'demoowner@gmail.com';
    const password = 'owner123';

    // Step 1: Check database
    console.log('Step 1: Checking database...\n');
    const [users] = await sequelize.query(`
      SELECT id, name, email, password, role FROM users WHERE email = '${email}'
    `);

    if (users.length === 0) {
      console.log('❌ User not found in database!\n');
      await sequelize.close();
      return;
    }

    const user = users[0];
    console.log('✅ User found in database:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user.id}\n`);

    // Step 2: Test password hash
    console.log('Step 2: Testing password hash...\n');
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      console.log('✅ Password hash matches!\n');
    } else {
      console.log('❌ Password hash does NOT match!\n');
      console.log('🔧 Resetting password...\n');
      const newHash = await bcrypt.hash(password, 10);
      await sequelize.query(`
        UPDATE users SET password = '${newHash}' WHERE email = '${email}'
      `);
      console.log('✅ Password reset complete!\n');
    }

    // Step 3: Test API endpoint
    console.log('Step 3: Testing API endpoint...\n');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      console.log('✅ API Login successful!');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Email: ${response.data.user.email}`);
      console.log(`   Role: ${response.data.user.role}\n`);
    } catch (apiError) {
      if (apiError.code === 'ECONNREFUSED') {
        console.log('❌ Backend server is NOT running!');
        console.log('   Please start the backend server first:\n');
        console.log('   cd backend');
        console.log('   npm start\n');
      } else if (apiError.response) {
        console.log('❌ API Login failed:');
        console.log(`   Status: ${apiError.response.status}`);
        console.log(`   Message: ${apiError.response.data.message}\n`);
      } else {
        console.log('❌ API Error:', apiError.message, '\n');
      }
    }

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST COMPLETE                               ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📝 SUMMARY:\n');
    console.log('─'.repeat(80));
    console.log('1. Database: User exists with correct password hash');
    console.log('2. API: Check if backend server is running on port 5000');
    console.log('3. Frontend: Should work if backend is running\n');

    console.log('🔗 TO START BACKEND:\n');
    console.log('─'.repeat(80));
    console.log('cd backend');
    console.log('npm start\n');

    console.log('🔗 THEN LOGIN AT:\n');
    console.log('─'.repeat(80));
    console.log('URL: http://localhost:5173/owner/login');
    console.log('Email: demoowner@gmail.com');
    console.log('Password: owner123\n');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

testOwnerLogin();
