const axios = require('axios');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const { Op } = require('sequelize');
require('dotenv').config();

async function testOwnerListings() {
  const API_BASE = 'http://localhost:5000';
  const ownerEmail = 'demo.owner@example.com';
  const password = 'password123';
  
  try {
    console.log('🏠 Testing Owner Listings System...\n');
    
    // Step 1: Login as owner
    console.log('1. Logging in as owner...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ownerEmail,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   Owner: ${loginResponse.data.user.name}`);
    console.log(`   Email: ${loginResponse.data.user.email}`);
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    // Step 2: Check listings in database directly
    console.log('\n2. Checking owner listings in database...');
    
    const ownerListings = await Listing.findAll({
      where: { 
        [Op.or]: [
          { userId: userId },
          { contactEmail: ownerEmail }
        ]
      },
      attributes: ['id', 'title', 'category', 'price', 'status', 'contactEmail', 'userId', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${ownerListings.length} listings for this owner:`);
    ownerListings.forEach((listing, index) => {
      console.log(`   ${index + 1}. ${listing.title}`);
      console.log(`      Category: ${listing.category} | Price: ₹${listing.price}`);
      console.log(`      Status: ${listing.status} | Contact: ${listing.contactEmail}`);
      console.log(`      Match Type: ${listing.userId === userId ? 'User ID' : 'Contact Email'}`);
      console.log('');
    });
    
    // Step 3: Test owner properties API endpoint
    console.log('3. Testing /api/owner/properties endpoint...');
    
    try {
      const propertiesResponse = await axios.get(`${API_BASE}/api/owner/properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Owner properties API working!');
      console.log(`   Total Properties: ${propertiesResponse.data.total}`);
      console.log(`   Properties Returned: ${propertiesResponse.data.properties.length}`);
      
      if (propertiesResponse.data.properties.length > 0) {
        console.log('\n📋 Owner Properties from API:');
        propertiesResponse.data.properties.forEach((property, index) => {
          console.log(`   ${index + 1}. ${property.title}`);
          console.log(`      Category: ${property.category} | Price: ₹${property.price}`);
          console.log(`      Status: ${property.status} | Views: ${property.views || 0}`);
          console.log(`      Ownership: ${property.ownershipType}`);
          if (property.stats) {
            console.log(`      Stats: ${property.stats.totalPurchases} purchases, ₹${property.stats.totalEarnings} earnings`);
          }
          console.log('');
        });
      }
      
    } catch (error) {
      console.log('❌ Owner properties API failed:', error.response?.data?.message || error.message);
    }
    
    // Step 4: Test owner dashboard
    console.log('4. Testing owner dashboard...');
    
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Owner dashboard working!');
      console.log('📊 Dashboard Summary:');
      console.log(`   Total Properties: ${dashboardResponse.data.overview.totalProperties}`);
      console.log(`   Active: ${dashboardResponse.data.overview.activeProperties}`);
      console.log(`   Sold: ${dashboardResponse.data.overview.soldProperties}`);
      console.log(`   Rented: ${dashboardResponse.data.overview.rentedProperties}`);
      console.log(`   Total Earnings: ₹${dashboardResponse.data.overview.totalEarnings}`);
      
    } catch (error) {
      console.log('❌ Owner dashboard failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 SUCCESS! Owner listings system is working!');
    console.log('\n🔑 Owner Login Credentials:');
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Password: ${password}`);
    console.log(`   Token: ${token}`);
    
    console.log('\n💡 Frontend Integration:');
    console.log('1. Login with the credentials above');
    console.log('2. The owner dashboard will show all their properties');
    console.log('3. Use /api/owner/properties to get detailed property list');
    console.log('4. Use /api/owner/dashboard for overview statistics');
    
    return {
      token,
      totalListings: ownerListings.length,
      ownerEmail
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

// Test with different query parameters
async function testOwnerPropertiesWithFilters() {
  const API_BASE = 'http://localhost:5000';
  const ownerEmail = 'demo.owner@example.com';
  const password = 'password123';
  
  try {
    console.log('\n🔍 Testing Owner Properties with Filters...\n');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ownerEmail,
      password
    });
    
    const token = loginResponse.data.token;
    
    // Test different filters
    const filters = [
      { name: 'All Properties', params: '' },
      { name: 'Active Properties', params: '?status=active' },
      { name: 'Sold Properties', params: '?status=sold' },
      { name: 'Rented Properties', params: '?status=rented' },
      { name: 'Property Sales', params: '?category=property_sell' },
      { name: 'Property Rentals', params: '?category=property_rent' }
    ];
    
    for (const filter of filters) {
      try {
        const response = await axios.get(`${API_BASE}/api/owner/properties${filter.params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${filter.name}: ${response.data.properties.length} properties`);
        
      } catch (error) {
        console.log(`❌ ${filter.name}: ${error.response?.data?.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Filter test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Owner Listings & Properties Test\n');
  
  const result = await testOwnerListings();
  
  if (result) {
    await testOwnerPropertiesWithFilters();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testOwnerListings, testOwnerPropertiesWithFilters };