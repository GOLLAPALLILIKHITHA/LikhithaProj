const axios = require('axios');

async function testAuth() {
  const API_BASE = 'http://localhost:5000';
  
  console.log('Testing API connection...');
  
  try {
    // Test basic connection
    const healthCheck = await axios.get(`${API_BASE}`);
    console.log('✅ Backend is running:', healthCheck.data.message);
    
    // Test auth endpoint exists
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {});
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Auth register endpoint exists (got validation error as expected)');
      } else {
        console.log('❌ Auth register endpoint issue:', error.response?.status, error.response?.data);
      }
    }
    
    // Try to create a test user
    console.log('\nCreating test user...');
    const testUser = {
      name: 'Test Owner',
      email: 'owner@test.com',
      password: 'password123',
      phone: '9876543210'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);
      console.log('✅ User created successfully!');
      console.log('Token:', registerResponse.data.token?.substring(0, 20) + '...');
      
      // Test dashboard access with token
      const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
        headers: { Authorization: `Bearer ${registerResponse.data.token}` }
      });
      console.log('✅ Dashboard access successful!');
      console.log('Dashboard data keys:', Object.keys(dashboardResponse.data));
      
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, trying login...');
        
        try {
          const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
          });
          console.log('✅ Login successful!');
          console.log('Token:', loginResponse.data.token?.substring(0, 20) + '...');
          
          // Test dashboard access
          const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
            headers: { Authorization: `Bearer ${loginResponse.data.token}` }
          });
          console.log('✅ Dashboard access successful!');
          console.log('Dashboard data keys:', Object.keys(dashboardResponse.data));
          
          console.log('\n🎉 SUCCESS! Use these credentials:');
          console.log('Email:', testUser.email);
          console.log('Password:', testUser.password);
          console.log('Token for localStorage:', loginResponse.data.token);
          
        } catch (loginError) {
          console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
        }
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

testAuth().catch(console.error);