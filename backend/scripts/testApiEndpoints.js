const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  try {
    console.log('🧪 Testing API endpoints...');

    // Test 1: Get all listings (should exclude leased properties)
    console.log('\n1. Testing GET /listings (should exclude leased properties)');
    try {
      const listingsResponse = await axios.get(`${BASE_URL}/listings?category=property_rent`);
      const listings = listingsResponse.data.listings || [];
      
      console.log(`Found ${listings.length} rental properties:`);
      listings.forEach((listing, index) => {
        console.log(`  ${index + 1}. ${listing.title} (ID: ${listing.id}) - isLeisure: ${listing.isLeisure}`);
      });
      
      // Check if Likhitha House (ID: 16) is hidden
      const likhithaHouse = listings.find(l => l.id === 16);
      if (likhithaHouse) {
        console.log('❌ ERROR: Likhitha House is still showing (should be hidden)');
      } else {
        console.log('✅ SUCCESS: Likhitha House is hidden as expected');
      }
    } catch (error) {
      console.error('❌ Error testing listings endpoint:', error.message);
    }

    // Test 2: Get admin leisure leases (need admin token - will fail but show if endpoint exists)
    console.log('\n2. Testing GET /leisure-lease/admin/all (admin endpoint)');
    try {
      const adminResponse = await axios.get(`${BASE_URL}/leisure-lease/admin/all`);
      console.log('✅ Admin endpoint accessible (this should not happen without auth)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Admin endpoint exists but requires authentication (expected)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Admin endpoint not found');
      } else {
        console.log('❌ Admin endpoint error:', error.message);
      }
    }

    // Test 3: Get user leisure leases (need user token - will fail but show if endpoint exists)
    console.log('\n3. Testing GET /leisure-lease/my-leases (user endpoint)');
    try {
      const userResponse = await axios.get(`${BASE_URL}/leisure-lease/my-leases`);
      console.log('✅ User endpoint accessible (this should not happen without auth)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ User endpoint exists but requires authentication (expected)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ User endpoint not found');
      } else {
        console.log('❌ User endpoint error:', error.message);
      }
    }

    // Test 4: Check if server is running and responding
    console.log('\n4. Testing server health');
    try {
      const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/`);
      console.log('✅ Server is running:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Server not responding:', error.message);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

// Run the test
testAPIEndpoints();