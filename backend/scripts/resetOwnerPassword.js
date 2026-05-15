const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

async function resetOwnerPassword(email, newPassword = 'password123') {
  try {
    console.log(`🔧 Resetting password for ${email}...`);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    
    console.log('✅ Password reset successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    return false;
  }
}

async function testOwnerLogin(email, password = 'password123') {
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log(`\n🔐 Testing login for ${email}...`);
    
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.user.name}`);
    console.log(`   Token: ${loginResponse.data.token.substring(0, 30)}...`);
    
    // Test owner dashboard
    console.log('\n📊 Testing owner dashboard...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    
    console.log('✅ Owner dashboard working!');
    console.log('📈 Dashboard Overview:');
    const overview = dashboardResponse.data.overview;
    console.log(`   Total Properties: ${overview.totalProperties}`);
    console.log(`   Active Properties: ${overview.activeProperties}`);
    console.log(`   Sold Properties: ${overview.soldProperties}`);
    console.log(`   Rented Properties: ${overview.rentedProperties}`);
    console.log(`   Total Earnings: ₹${overview.totalEarnings}`);
    console.log(`   Purchase Earnings: ₹${overview.purchaseEarnings}`);
    console.log(`   Rent Earnings: ₹${overview.rentEarnings}`);
    
    console.log('\n🎉 SUCCESS! Owner dashboard is fully functional!');
    console.log('\n🔑 SOLUTION FOR FRONTEND:');
    console.log('1. Open your browser and go to the owner dashboard page');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Run this command:');
    console.log(`   localStorage.setItem('token', '${loginResponse.data.token}');`);
    console.log('5. Refresh the page');
    console.log('\nOR login with these credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    return loginResponse.data.token;
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Owner Password Reset & Dashboard Test\n');
  
  const ownerEmails = [
    'demo.owner@example.com',
    'propertyowner@example.com', 
    'ramesh@gmail.com'
  ];
  
  for (const email of ownerEmails) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing owner: ${email}`);
    console.log('='.repeat(50));
    
    // Reset password
    const resetSuccess = await resetOwnerPassword(email);
    
    if (resetSuccess) {
      // Test login and dashboard
      const token = await testOwnerLogin(email);
      
      if (token) {
        console.log(`\n✅ ${email} is ready to use!`);
        break; // Success with first owner
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { resetOwnerPassword, testOwnerLogin };