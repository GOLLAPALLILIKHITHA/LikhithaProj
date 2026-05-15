const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n');
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n🔧 Creating a test user...');
      
      // Create a test user directly in the database
      const hashedPassword = await bcrypt.hash('password123', 10);
      const testUser = await User.create({
        name: 'Test Owner',
        email: 'owner@test.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'user'
      });
      
      console.log('✅ Test user created successfully!');
      console.log('   Email: owner@test.com');
      console.log('   Password: password123');
      console.log('   ID:', testUser.id);
      
      return testUser;
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      
      // Try to find a user we can use for testing
      const testUser = users.find(u => u.email.includes('test') || u.email.includes('owner'));
      if (testUser) {
        console.log(`\n🎯 Found potential test user: ${testUser.email}`);
        console.log('   Try logging in with this email and password: password123');
      }
      
      return users[0]; // Return first user
    }
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    return null;
  }
}

async function testLogin(email, password = 'password123') {
  const axios = require('axios');
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log(`\n🔐 Testing login for ${email}...`);
    
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log('   Token:', response.data.token.substring(0, 30) + '...');
    console.log('   User:', response.data.user.name);
    
    // Test owner dashboard access
    console.log('\n📊 Testing owner dashboard access...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
      headers: { Authorization: `Bearer ${response.data.token}` }
    });
    
    console.log('✅ Owner dashboard accessible!');
    console.log('   Properties:', dashboardResponse.data.overview.totalProperties);
    console.log('   Earnings:', dashboardResponse.data.overview.totalEarnings);
    
    console.log('\n🎉 SUCCESS! Use these credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token for localStorage: ${response.data.token}`);
    
    return response.data.token;
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 User Database Check & Auth Test\n');
  
  const user = await checkUsers();
  
  if (user) {
    // Try common passwords
    const passwords = ['password123', 'admin123', '123456', 'password'];
    
    for (const password of passwords) {
      const token = await testLogin(user.email, password);
      if (token) {
        break;
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkUsers, testLogin };