const axios = require('axios');

async function testAdminAPI() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🔐 Testing admin login...');
    
    // First, login as admin
    const loginResponse = await axios.post(`${baseURL}/admin/login`, {
      email: process.env.ADMIN_EMAIL || 'admin@infraall.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test getting listings
    console.log('\n📋 Testing admin listings endpoint...');
    
    const listingsResponse = await axios.get(`${baseURL}/admin/listings`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const { listings, total } = listingsResponse.data;
    
    console.log(`✅ Admin listings API successful`);
    console.log(`📊 Total listings: ${total}`);
    console.log(`📋 Returned listings: ${listings.length}`);
    
    if (listings.length > 0) {
      console.log('\n📝 Sample listings:');
      listings.slice(0, 5).forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title}`);
        console.log(`   Category: ${listing.category}`);
        console.log(`   Price: ₹${listing.price}`);
        console.log(`   Status: ${listing.status}`);
        console.log(`   Seller: ${listing.seller ? listing.seller.name : 'No seller'}`);
        console.log('');
      });
    }
    
    // Test with pagination
    console.log('🔍 Testing pagination...');
    const paginatedResponse = await axios.get(`${baseURL}/admin/listings?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log(`✅ Pagination test: ${paginatedResponse.data.listings.length} listings returned`);
    
    // Test with search
    console.log('\n🔍 Testing search...');
    const searchResponse = await axios.get(`${baseURL}/admin/listings?search=apartment`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log(`✅ Search test: ${searchResponse.data.listings.length} listings found for "apartment"`);
    
    console.log('\n🎉 All admin API tests passed!');
    console.log('\n📝 If admin dashboard still not showing listings, the issue is in the frontend:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Check network tab for API calls');
    console.log('   3. Verify admin authentication in frontend');
    console.log('   4. Check frontend component rendering');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Server is not running! Please start the backend server first.');
    }
  }
}

// Run the test
testAdminAPI();