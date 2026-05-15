const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

async function checkVendors() {
  try {
    console.log('🔍 Checking existing vendors in database...\n');
    
    const vendors = await Vendor.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    if (vendors.length === 0) {
      console.log('❌ No vendors found in database');
      return null;
    } else {
      console.log(`✅ Found ${vendors.length} vendors:`);
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.businessName}`);
        console.log(`   Contact: ${vendor.contactPerson} (${vendor.contactEmail})`);
        console.log(`   Type: ${vendor.vendorType} | City: ${vendor.city}`);
        console.log(`   User: ${vendor.user?.name} (${vendor.user?.email})`);
        console.log(`   Status: ${vendor.isActive ? 'Active' : 'Inactive'} | Verified: ${vendor.isVerified ? 'Yes' : 'No'}`);
        console.log('');
      });
      
      return vendors;
    }
  } catch (error) {
    console.error('❌ Error checking vendors:', error.message);
    return null;
  }
}

async function testVendorLogin(email, password = 'password123') {
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log(`\n🔐 Testing vendor login for ${email}...`);
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.user.name}`);
    console.log(`   Token: ${loginResponse.data.token.substring(0, 30)}...`);
    
    // Test vendor /me endpoint
    console.log('\n👤 Testing vendor /me endpoint...');
    const vendorMeResponse = await axios.get(`${API_BASE}/api/vendor/me`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
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
    
    // Test vendor assignments
    console.log('\n📋 Testing vendor assignments...');
    const assignmentsResponse = await axios.get(`${API_BASE}/api/vendor/assignments`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
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
      console.log('   No assignments found');
    }
    
    console.log('\n🎉 SUCCESS! Vendor portal is working!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token: ${loginResponse.data.token}`);
    
    console.log('\n💡 To fix the frontend vendor login:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Application/Storage > Local Storage');
    console.log(`3. Set: localStorage.setItem('token', '${loginResponse.data.token}');`);
    console.log('4. Refresh the vendor portal page');
    
    return loginResponse.data.token;
    
  } catch (error) {
    console.log('❌ Vendor login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function createTestVendor() {
  try {
    console.log('\n🔧 Creating test vendor...');
    
    // First create a user account
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test Vendor User',
      email: 'vendor@test.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'user'
    });
    
    console.log('✅ User account created');
    
    // Create vendor profile
    const vendor = await Vendor.create({
      businessName: 'Test Vendor Services',
      contactPerson: 'Test Vendor',
      contactPhone: '9876543210',
      contactEmail: 'vendor@test.com',
      whatsappNumber: '9876543210',
      businessAddress: '123 Test Street, Test City',
      vendorType: 'home_services',
      categories: ['plumbing', 'electrical'],
      description: 'Test vendor for plumbing and electrical services',
      experience: '5 years',
      serviceArea: 'Test City',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      minPrice: 500,
      maxPrice: 5000,
      priceType: 'per_hour',
      languages: ['English', 'Hindi'],
      availability: 'weekdays',
      isActive: true,
      isVerified: true,
      userId: user.id
    });
    
    console.log('✅ Vendor profile created successfully!');
    console.log(`   Business: ${vendor.businessName}`);
    console.log(`   Email: ${vendor.contactEmail}`);
    console.log('   Password: password123');
    
    return { user, vendor };
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Test vendor already exists');
      return null;
    }
    console.error('❌ Error creating test vendor:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Vendor Authentication Check & Test\n');
  
  // Check existing vendors
  const vendors = await checkVendors();
  
  let testEmail = null;
  
  if (vendors && vendors.length > 0) {
    // Try to find a vendor with a user account
    const vendorWithUser = vendors.find(v => v.user && v.user.email);
    if (vendorWithUser) {
      testEmail = vendorWithUser.user.email;
      console.log(`\n🎯 Found vendor with user account: ${testEmail}`);
    }
  }
  
  // If no vendors found, create a test vendor
  if (!testEmail) {
    console.log('\n🔧 No vendors with user accounts found. Creating test vendor...');
    const testVendor = await createTestVendor();
    if (testVendor) {
      testEmail = testVendor.user.email;
    }
  }
  
  // Test vendor login
  if (testEmail) {
    await testVendorLogin(testEmail);
  } else {
    console.log('❌ No vendor email available for testing');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkVendors, testVendorLogin, createTestVendor };