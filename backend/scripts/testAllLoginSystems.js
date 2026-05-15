const axios = require('axios');
require('dotenv').config();

async function testAllLoginSystems() {
  const API_BASE = 'http://localhost:5000';
  
  console.log('🔐 Testing All Login Systems\n');
  
  const loginSystems = [
    {
      name: '👤 General User Login',
      frontendUrl: 'http://localhost:5173/login',
      credentials: { email: 'demo.owner@example.com', password: 'password123' },
      dashboardUrl: 'http://localhost:5173/owner/dashboard',
      description: 'General login for all users'
    },
    {
      name: '🏠 Owner Login (Dedicated)',
      frontendUrl: 'http://localhost:5173/owner/login',
      credentials: { email: 'demo.owner@example.com', password: 'password123' },
      dashboardUrl: 'http://localhost:5173/owner/dashboard',
      description: 'Dedicated owner login portal'
    },
    {
      name: '🏢 Vendor Login (Dedicated)',
      frontendUrl: 'http://localhost:5173/vendor/login',
      credentials: { email: 'materials@vendor.com', password: 'password123' },
      dashboardUrl: 'http://localhost:5173/vendor',
      description: 'Dedicated vendor login portal'
    }
  ];
  
  for (const system of loginSystems) {
    console.log(`${system.name}`);
    console.log(`Description: ${system.description}`);
    console.log(`Frontend URL: ${system.frontendUrl}`);
    console.log(`Credentials: ${system.credentials.email} / ${system.credentials.password}`);
    
    try {
      // Test backend login
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, system.credentials);
      
      console.log('✅ Backend login successful!');
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Token: ${loginResponse.data.token.substring(0, 30)}...`);
      
      // Test specific endpoints based on user type
      const token = loginResponse.data.token;
      
      if (system.name.includes('Owner')) {
        try {
          const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Owner dashboard accessible!');
          console.log(`   Properties: ${dashboardResponse.data.overview.totalProperties}`);
        } catch (error) {
          console.log('❌ Owner dashboard failed:', error.response?.data?.message || error.message);
        }
      }
      
      if (system.name.includes('Vendor')) {
        try {
          const vendorResponse = await axios.get(`${API_BASE}/api/vendor/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Vendor portal accessible!');
          console.log(`   Business: ${vendorResponse.data.businessName}`);
        } catch (error) {
          console.log('❌ Vendor portal failed:', error.response?.data?.message || error.message);
        }
      }
      
      console.log(`   Dashboard URL: ${system.dashboardUrl}`);
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }
    
    console.log(''); // Empty line for separation
  }
  
  console.log('🎯 Summary of Login Systems:');
  console.log('');
  console.log('┌─────────────────┬─────────────────────────────────┬─────────────────────────────────┐');
  console.log('│ Login Type      │ Frontend URL                    │ Dashboard URL                   │');
  console.log('├─────────────────┼─────────────────────────────────┼─────────────────────────────────┤');
  console.log('│ General User    │ /login                          │ /owner/dashboard                │');
  console.log('│ Owner Portal    │ /owner/login                    │ /owner/dashboard                │');
  console.log('│ Vendor Portal   │ /vendor/login                   │ /vendor                         │');
  console.log('└─────────────────┴─────────────────────────────────┴─────────────────────────────────┘');
  console.log('');
  
  console.log('🔑 Login Credentials:');
  console.log('');
  console.log('Owner Account:');
  console.log('  Email: demo.owner@example.com');
  console.log('  Password: password123');
  console.log('  Properties: 7 (4 rent, 3 buy)');
  console.log('');
  console.log('Vendor Account:');
  console.log('  Email: materials@vendor.com');
  console.log('  Password: password123');
  console.log('  Business: Premium Building Materials');
  console.log('  Assignments: 1');
  console.log('');
  
  console.log('💡 Usage Instructions:');
  console.log('1. Restart both frontend and backend servers');
  console.log('2. Access the appropriate login URL');
  console.log('3. Use the credentials above');
  console.log('4. You will be redirected to the respective dashboard');
}

if (require.main === module) {
  testAllLoginSystems().catch(console.error);
}

module.exports = { testAllLoginSystems };