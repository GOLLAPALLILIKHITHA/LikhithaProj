const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

async function resetVendorPassword(email, newPassword = 'password123') {
  try {
    console.log(`🔧 Resetting password for vendor ${email}...`);
    
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

async function testVendorPortal(email, password = 'password123') {
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log(`\n🔐 Testing vendor portal for ${email}...`);
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.user.name}`);
    console.log(`   Has Vendor Profile: ${loginResponse.data.user.vendor ? 'Yes' : 'No'}`);
    
    if (loginResponse.data.user.vendor) {
      console.log(`   Vendor Business: ${loginResponse.data.user.vendor.businessName}`);
      console.log(`   Vendor Type: ${loginResponse.data.user.vendor.vendorType}`);
    }
    
    const token = loginResponse.data.token;
    
    // Test vendor /me endpoint
    console.log('\n👤 Testing vendor /me endpoint...');
    try {
      const vendorMeResponse = await axios.get(`${API_BASE}/api/vendor/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Vendor /me endpoint working!');
      console.log('🏢 Vendor Details:');
      console.log(`   Business Name: ${vendorMeResponse.data.businessName}`);
      console.log(`   Contact Person: ${vendorMeResponse.data.contactPerson}`);
      console.log(`   Email: ${vendorMeResponse.data.contactEmail}`);
      console.log(`   Phone: ${vendorMeResponse.data.contactPhone}`);
      console.log(`   Type: ${vendorMeResponse.data.vendorType}`);
      console.log(`   City: ${vendorMeResponse.data.city}`);
      console.log(`   Verified: ${vendorMeResponse.data.isVerified ? 'Yes' : 'No'}`);
      
    } catch (error) {
      console.log('❌ Vendor /me failed:', error.response?.data?.message || error.message);
    }
    
    // Test vendor assignments
    console.log('\n📋 Testing vendor assignments...');
    try {
      const assignmentsResponse = await axios.get(`${API_BASE}/api/vendor/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Vendor assignments endpoint working!');
      console.log(`   Total Assignments: ${assignmentsResponse.data.assignments.length}`);
      
      if (assignmentsResponse.data.assignments.length > 0) {
        console.log('   Recent Assignments:');
        assignmentsResponse.data.assignments.slice(0, 3).forEach((assignment, index) => {
          console.log(`     ${index + 1}. ${assignment.serviceType} - ${assignment.status}`);
          console.log(`        Customer: ${assignment.customer.name}`);
          console.log(`        Created: ${new Date(assignment.createdAt).toLocaleDateString()}`);
        });
      } else {
        console.log('   No assignments found for this vendor');
      }
      
    } catch (error) {
      console.log('❌ Vendor assignments failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 SUCCESS! Vendor portal is working!');
    console.log('\n🔑 Vendor Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token: ${token}`);
    
    console.log('\n💡 To fix the frontend vendor login issue:');
    console.log('1. Open your browser and go to the vendor login page');
    console.log('2. Use the credentials above to login');
    console.log('3. OR set the token directly in localStorage:');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log('4. Then refresh the vendor portal page');
    
    return token;
    
  } catch (error) {
    console.log('❌ Vendor portal test failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Vendor Password Reset & Portal Test\n');
  
  const vendorEmail = 'materials@vendor.com';
  
  // Reset password
  const resetSuccess = await resetVendorPassword(vendorEmail);
  
  if (resetSuccess) {
    // Test vendor portal
    await testVendorPortal(vendorEmail);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { resetVendorPassword, testVendorPortal };