const axios = require('axios');
require('dotenv').config();

async function testEnhancedOwnerDashboard() {
  const API_BASE = 'http://localhost:5000';
  const ownerEmail = 'demo.owner@example.com';
  const password = 'password123';
  
  try {
    console.log('🏠 Testing Enhanced Owner Dashboard with Two Sections...\n');
    
    // Step 1: Login as owner
    console.log('1. Logging in as owner...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ownerEmail,
      password
    });
    
    console.log('✅ Login successful!');
    console.log(`   Owner: ${loginResponse.data.user.name}`);
    
    const token = loginResponse.data.token;
    
    // Step 2: Test main dashboard
    console.log('\n2. Testing main dashboard...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Dashboard working!');
      console.log('📊 Overview:');
      console.log(`   Total Properties: ${dashboardResponse.data.overview.totalProperties}`);
      console.log(`   Active: ${dashboardResponse.data.overview.activeProperties}`);
      console.log(`   Sold: ${dashboardResponse.data.overview.soldProperties}`);
      console.log(`   Rented: ${dashboardResponse.data.overview.rentedProperties}`);
      console.log(`   Total Earnings: ₹${dashboardResponse.data.overview.totalEarnings}`);
      
    } catch (error) {
      console.log('❌ Dashboard failed:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Test properties with sections
    console.log('\n3. Testing properties with section filters...');
    
    const sections = [
      { name: 'All Properties', endpoint: '/api/owner/properties' },
      { name: 'Rent Properties', endpoint: '/api/owner/properties?section=rent' },
      { name: 'Buy Properties', endpoint: '/api/owner/properties?section=buy' },
      { name: 'Active Rent Properties', endpoint: '/api/owner/properties?section=rent&status=active' },
      { name: 'Sold Properties', endpoint: '/api/owner/properties?section=buy&status=sold' }
    ];
    
    for (const section of sections) {
      try {
        const response = await axios.get(`${API_BASE}${section.endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ ${section.name}: ${response.data.properties.length} properties`);
        
        if (response.data.summary) {
          console.log(`   Summary - Rent: ${response.data.summary.rentProperties}, Buy: ${response.data.summary.buyProperties}`);
          console.log(`   Earnings - Rent: ₹${response.data.summary.totalRentEarnings}, Sale: ₹${response.data.summary.totalSaleEarnings}`);
        }
        
        // Show first property details if available
        if (response.data.properties.length > 0) {
          const property = response.data.properties[0];
          console.log(`   Sample: ${property.title} (${property.type || 'N/A'})`);
          
          if (property.rentalDetails && property.rentalDetails.length > 0) {
            console.log(`     Rentals: ${property.rentalDetails.length}, Active: ${property.activeRentals}`);
            console.log(`     Rent Earnings: ₹${property.totalRentEarnings}`);
          }
          
          if (property.purchaseDetails && property.purchaseDetails.length > 0) {
            console.log(`     Purchases: ${property.purchaseDetails.length}, Completed: ${property.completedPurchases}`);
            console.log(`     Sale Earnings: ₹${property.totalSaleEarnings}`);
          }
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`❌ ${section.name} failed:`, error.response?.data?.message || error.message);
      }
    }
    
    // Step 4: Test detailed rent tracking
    console.log('4. Testing detailed rent tracking...');
    try {
      const rentTrackingResponse = await axios.get(`${API_BASE}/api/owner/rent-tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Rent tracking working!');
      console.log(`   Total Rent Tracking Records: ${rentTrackingResponse.data.rentTracking.length}`);
      
      if (rentTrackingResponse.data.summary) {
        const summary = rentTrackingResponse.data.summary;
        console.log('📊 Rent Summary:');
        console.log(`   Total Properties: ${summary.totalProperties}`);
        console.log(`   Active Rentals: ${summary.activeRentals}`);
        console.log(`   Monthly Rent: ₹${summary.totalMonthlyRent}`);
        console.log(`   Pending Payments: ${summary.pendingPayments}`);
        console.log(`   Overdue Payments: ${summary.overduePayments}`);
        console.log(`   Total Received: ₹${summary.totalReceived}`);
      }
      
      // Show sample rent tracking if available
      if (rentTrackingResponse.data.rentTracking.length > 0) {
        const rental = rentTrackingResponse.data.rentTracking[0];
        console.log('\n📋 Sample Rent Tracking:');
        console.log(`   Property: ${rental.property.title}`);
        if (rental.tenant) {
          console.log(`   Tenant: ${rental.tenant.name} (${rental.tenant.email})`);
        }
        console.log(`   Monthly Rent: ₹${rental.rentalInfo.monthlyRent}`);
        console.log(`   Status: ${rental.rentalInfo.status}`);
        console.log(`   Payments: ${rental.paymentSummary.paidPayments}/${rental.paymentSummary.totalPayments} paid`);
        console.log(`   Total Received: ₹${rental.paymentSummary.totalReceived}`);
        
        if (rental.paymentSummary.nextPaymentDue) {
          console.log(`   Next Due: ₹${rental.paymentSummary.nextPaymentDue.amount} on ${rental.paymentSummary.nextPaymentDue.dueDate}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Rent tracking failed:', error.response?.data?.message || error.message);
    }
    
    // Step 5: Test detailed purchase tracking
    console.log('\n5. Testing detailed purchase tracking...');
    try {
      const purchaseTrackingResponse = await axios.get(`${API_BASE}/api/owner/purchase-tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Purchase tracking working!');
      console.log(`   Total Purchase Tracking Records: ${purchaseTrackingResponse.data.purchaseTracking.length}`);
      
      if (purchaseTrackingResponse.data.summary) {
        const summary = purchaseTrackingResponse.data.summary;
        console.log('📊 Purchase Summary:');
        console.log(`   Total Properties: ${summary.totalProperties}`);
        console.log(`   Total Purchases: ${summary.totalPurchases}`);
        console.log(`   Completed Sales: ${summary.completedSales}`);
        console.log(`   Pending Sales: ${summary.pendingSales}`);
        console.log(`   Total Earnings: ₹${summary.totalEarnings}`);
        console.log(`   Pending Amount: ₹${summary.pendingAmount}`);
      }
      
      // Show sample purchase tracking if available
      if (purchaseTrackingResponse.data.purchaseTracking.length > 0) {
        const purchase = purchaseTrackingResponse.data.purchaseTracking[0];
        console.log('\n💰 Sample Purchase Tracking:');
        console.log(`   Property: ${purchase.property.title}`);
        if (purchase.buyer) {
          console.log(`   Buyer: ${purchase.buyer.name} (${purchase.buyer.email})`);
        }
        console.log(`   Amount: ₹${purchase.purchaseInfo.totalAmount}`);
        console.log(`   Status: ${purchase.purchaseInfo.status}`);
        console.log(`   Payment Status: ${purchase.purchaseInfo.paymentStatus}`);
        console.log(`   Document Status: ${purchase.documentInfo.status}`);
      }
      
    } catch (error) {
      console.log('❌ Purchase tracking failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 SUCCESS! Enhanced Owner Dashboard is working!');
    console.log('\n🔑 API Endpoints Available:');
    console.log('   📊 Dashboard: GET /api/owner/dashboard');
    console.log('   🏠 All Properties: GET /api/owner/properties');
    console.log('   🏠 Rent Properties: GET /api/owner/properties?section=rent');
    console.log('   🏠 Buy Properties: GET /api/owner/properties?section=buy');
    console.log('   📋 Rent Tracking: GET /api/owner/rent-tracking');
    console.log('   💰 Purchase Tracking: GET /api/owner/purchase-tracking');
    
    console.log('\n💡 Frontend Implementation:');
    console.log('1. Create two main sections: "Rent Properties" and "Buy Properties"');
    console.log('2. Add filter buttons at the top for each section');
    console.log('3. Use section parameter to filter properties by type');
    console.log('4. Show detailed tracking information for each property type');
    console.log('5. Display payment status, due dates, and earnings separately');
    
    return token;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

if (require.main === module) {
  testEnhancedOwnerDashboard().catch(console.error);
}

module.exports = { testEnhancedOwnerDashboard };