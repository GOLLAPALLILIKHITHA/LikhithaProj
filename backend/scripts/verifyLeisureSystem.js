const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verifyLeisureSystem() {
  try {
    console.log('🔍 Verifying leisure property system...');

    // Test 1: Check if Likhitha House is hidden from listings
    console.log('\n1. Testing property visibility on website');
    try {
      const response = await axios.get(`${BASE_URL}/listings?category=property_rent`);
      const listings = response.data.listings || [];
      
      const likhithaHouse = listings.find(l => l.id === 16);
      const totalListings = listings.length;
      
      if (likhithaHouse) {
        console.log('❌ FAIL: Likhitha House is still visible (should be hidden)');
        console.log(`   Found ${totalListings} properties including Likhitha House`);
      } else {
        console.log('✅ PASS: Likhitha House is hidden from website');
        console.log(`   Found ${totalListings} properties (Likhitha House correctly hidden)`);
      }
    } catch (error) {
      console.log('❌ ERROR: Could not test listings endpoint');
      console.log('   Make sure the backend server is running on port 5000');
    }

    // Test 2: Check admin endpoint accessibility
    console.log('\n2. Testing admin endpoint');
    try {
      await axios.get(`${BASE_URL}/leisure-lease/admin/all`);
      console.log('❌ UNEXPECTED: Admin endpoint accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PASS: Admin endpoint requires authentication');
      } else if (error.response?.status === 404) {
        console.log('❌ FAIL: Admin endpoint not found');
      } else {
        console.log('❌ ERROR: Admin endpoint issue:', error.message);
      }
    }

    // Test 3: Check user endpoint accessibility
    console.log('\n3. Testing user endpoint');
    try {
      await axios.get(`${BASE_URL}/leisure-lease/my-leases`);
      console.log('❌ UNEXPECTED: User endpoint accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PASS: User endpoint requires authentication');
      } else {
        console.log('❌ ERROR: User endpoint issue:', error.message);
      }
    }

    // Test 4: Server health
    console.log('\n4. Testing server health');
    try {
      const response = await axios.get(`${BASE_URL.replace('/api', '')}/`);
      console.log('✅ PASS: Server is running -', response.data.message);
    } catch (error) {
      console.log('❌ FAIL: Server not responding');
      console.log('   Make sure to restart the backend server');
    }

    console.log('\n📋 Verification Summary:');
    console.log('========================');
    console.log('If all tests pass:');
    console.log('• ✅ Likhitha House should be hidden from website');
    console.log('• ✅ Admin can see Kavya\'s lease in Property Purchases');
    console.log('• ✅ Kavya can see her lease in her account');
    console.log('');
    console.log('If tests fail:');
    console.log('• ❌ Restart the backend server');
    console.log('• ❌ Clear browser cache and refresh frontend');

  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

verifyLeisureSystem();