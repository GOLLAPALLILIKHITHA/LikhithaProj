const axios = require('axios');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugDashboard() {
  const API_BASE = 'http://localhost:5000';
  const email = 'demo.owner@example.com';
  const password = 'password123';
  
  try {
    console.log('🔍 Debugging Owner Dashboard Issue...\n');
    
    // Step 1: Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   User ID: ${loginResponse.data.user.id}`);
    console.log(`   User Email: ${loginResponse.data.user.email}`);
    console.log(`   User Name: ${loginResponse.data.user.name}`);
    
    const token = loginResponse.data.token;
    
    // Step 2: Test /me endpoint
    console.log('\n2. Testing /me endpoint...');
    try {
      const meResponse = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ /me endpoint working');
      console.log(`   User: ${meResponse.data.name} (${meResponse.data.email})`);
    } catch (error) {
      console.log('❌ /me endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Test owner dashboard with detailed error handling
    console.log('\n3. Testing owner dashboard...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Dashboard API successful!');
      console.log('📊 Dashboard Data:');
      console.log(JSON.stringify(dashboardResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Dashboard API failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Status Text:', error.response?.statusText);
      console.log('   Error Message:', error.response?.data?.message || error.message);
      console.log('   Full Error Data:', error.response?.data);
      
      if (error.code === 'ECONNABORTED') {
        console.log('   → Request timed out - dashboard query might be slow');
      }
    }
    
    // Step 4: Check database directly
    console.log('\n4. Checking database directly...');
    const user = await User.findOne({ where: { email } });
    if (user) {
      console.log(`✅ User found in database: ID ${user.id}`);
      
      // Import models to check listings
      const Listing = require('../src/models/Listing');
      const { Op } = require('sequelize');
      
      const userListings = await Listing.count({
        where: { 
          [Op.or]: [
            { userId: user.id },
            { contactEmail: email }
          ]
        }
      });
      
      console.log(`   Listings for this user: ${userListings}`);
      
      if (userListings > 0) {
        const listings = await Listing.findAll({
          where: { 
            [Op.or]: [
              { userId: user.id },
              { contactEmail: email }
            ]
          },
          attributes: ['id', 'title', 'contactEmail', 'userId', 'status'],
          limit: 5
        });
        
        console.log('   Sample listings:');
        listings.forEach(listing => {
          console.log(`     - ${listing.title} (${listing.status})`);
        });
      }
    } else {
      console.log('❌ User not found in database');
    }
    
    console.log('\n🎯 SOLUTION:');
    console.log('If the dashboard API is working, use these credentials in the frontend:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token: ${token}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

if (require.main === module) {
  debugDashboard().catch(console.error);
}

module.exports = { debugDashboard };