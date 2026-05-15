const Listing = require('../src/models/Listing');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

async function checkListingOwners() {
  try {
    console.log('🏠 Checking listings and their owners...\n');
    
    // Get all listings with their contact emails
    const listings = await Listing.findAll({
      attributes: ['id', 'title', 'contactEmail', 'contactPerson', 'userId', 'category', 'price', 'status'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    if (listings.length === 0) {
      console.log('❌ No listings found in database');
      return;
    }
    
    console.log(`✅ Found ${listings.length} listings:`);
    
    // Group listings by contact email
    const ownerEmails = {};
    
    listings.forEach((listing, index) => {
      const email = listing.contactEmail;
      if (!ownerEmails[email]) {
        ownerEmails[email] = [];
      }
      ownerEmails[email].push(listing);
      
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   Owner Email: ${email}`);
      console.log(`   Contact Person: ${listing.contactPerson}`);
      console.log(`   Category: ${listing.category} | Price: ₹${listing.price} | Status: ${listing.status}`);
      console.log('');
    });
    
    console.log('\n📊 Owner Summary:');
    Object.keys(ownerEmails).forEach(email => {
      const count = ownerEmails[email].length;
      console.log(`   ${email}: ${count} properties`);
    });
    
    return ownerEmails;
    
  } catch (error) {
    console.error('❌ Error checking listings:', error.message);
    return null;
  }
}

async function createOwnerAccount(email, name = 'Property Owner') {
  try {
    console.log(`\n🔧 Creating owner account for ${email}...`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('ℹ️  User already exists');
      return existingUser;
    }
    
    // Create new user account
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      phone: '9876543210', // Default phone
      role: 'user'
    });
    
    console.log('✅ Owner account created successfully!');
    console.log(`   Email: ${email}`);
    console.log('   Password: password123');
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating owner account:', error.message);
    return null;
  }
}

async function testOwnerDashboard(email, password = 'password123') {
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log(`\n🔐 Testing owner dashboard for ${email}...`);
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    
    // Test owner dashboard
    const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    
    console.log('✅ Owner dashboard accessible!');
    console.log('📊 Dashboard Data:');
    console.log(`   Total Properties: ${dashboardResponse.data.overview.totalProperties}`);
    console.log(`   Active Properties: ${dashboardResponse.data.overview.activeProperties}`);
    console.log(`   Total Earnings: ₹${dashboardResponse.data.overview.totalEarnings}`);
    console.log(`   Recent Purchases: ${dashboardResponse.data.recentActivity.purchases.length}`);
    console.log(`   Recent Rent Payments: ${dashboardResponse.data.recentActivity.rentPayments.length}`);
    
    console.log('\n🎉 SUCCESS! Owner dashboard is working!');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token: ${loginResponse.data.token}`);
    
    console.log('\n💡 To fix the frontend issue:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Application/Storage > Local Storage');
    console.log(`3. Set: localStorage.setItem('token', '${loginResponse.data.token}');`);
    console.log('4. Refresh the owner dashboard page');
    
    return loginResponse.data.token;
    
  } catch (error) {
    console.log('❌ Dashboard test failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Listing Owners Check & Dashboard Test\n');
  
  // Check all listings and their owners
  const ownerEmails = await checkListingOwners();
  
  if (!ownerEmails || Object.keys(ownerEmails).length === 0) {
    console.log('❌ No owner emails found in listings');
    return;
  }
  
  // Get the first owner email with properties
  const firstOwnerEmail = Object.keys(ownerEmails)[0];
  const propertyCount = ownerEmails[firstOwnerEmail].length;
  
  console.log(`\n🎯 Testing with owner: ${firstOwnerEmail} (${propertyCount} properties)`);
  
  // Create owner account if it doesn't exist
  const ownerName = ownerEmails[firstOwnerEmail][0].contactPerson || 'Property Owner';
  await createOwnerAccount(firstOwnerEmail, ownerName);
  
  // Test owner dashboard
  await testOwnerDashboard(firstOwnerEmail);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkListingOwners, createOwnerAccount, testOwnerDashboard };