const axios = require('axios');

async function testRentalCreation() {
  try {
    console.log('🧪 Testing rental creation...');
    
    // First, let's check if we have any active listings for rent
    const listingsResponse = await axios.get('http://localhost:5000/api/listings?category=property_rent');
    const rentListings = listingsResponse.data.listings || listingsResponse.data;
    
    if (!rentListings || rentListings.length === 0) {
      console.log('❌ No rental properties found');
      return;
    }
    
    console.log(`✅ Found ${rentListings.length} rental properties`);
    console.log(`- Testing with: ${rentListings[0].title} (ID: ${rentListings[0].id})`);
    
    // Test rental creation (this will fail without auth, but we can see the error)
    try {
      const rentalResponse = await axios.post('http://localhost:5000/api/property-rentals/create-order', {
        listingId: rentListings[0].id,
        startDate: '2026-05-05'
      });
      console.log('✅ Rental creation successful:', rentalResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Rental endpoint is working (authentication required as expected)');
      } else {
        console.log('❌ Rental creation error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRentalCreation();