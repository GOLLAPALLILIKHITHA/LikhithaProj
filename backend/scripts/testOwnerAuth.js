const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000';

async function testOwnerAuth() {
  console.log('🔍 Testing Owner Authentication Flow...\n');
  
  try {
    // Test 1: Try to access owner dashboard without token
    console.log('1. Testing dashboard access without token...');
    try {
      const response = await axios.get(`${API_BASE}/api/owner/dashboard`);
      console.log('❌ ERROR: Dashboard accessible without token!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ GOOD: Dashboard properly protected (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 2: Check if we can login with test credentials
    console.log('\n2. Testing login with test credentials...');
    
    // Try to login with common test credentials
    const testCredentials = [
      { email: 'owner@test.com', password: 'password123' },
      { email: 'test@owner.com', password: 'password123' },
      { email: 'owner@example.com', password: 'password' },
      { email: 'admin@test.com', password: 'admin123' }
    ];
    
    let validToken = null;
    
    for (const creds of testCredentials) {
      try {
        console.log(`   Trying: ${creds.email}`);
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, creds);
        
        if (loginResponse.data.token) {
          console.log(`✅ SUCCESS: Login successful for ${creds.email}`);
          console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
          console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`);
          validToken = loginResponse.data.token;
          break;
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test 3: If we have a valid token, test dashboard access
    if (validToken) {
      console.log('\n3. Testing dashboard access with valid token...');
      try {
        const dashboardResponse = await axios.get(`${API_BASE}/api/owner/dashboard`, {
          headers: {
            'Authorization': `Bearer ${validToken}`
          }
        });
        
        console.log('✅ SUCCESS: Dashboard accessible with token!');
        console.log('   Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
        
      } catch (error) {
        console.log('❌ Dashboard access failed:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('\n❌ No valid login credentials found. You need to:');
      console.log('   1. Register a new account');
      console.log('   2. Or check existing user credentials');
    }
    
    // Test 4: Check what users exist in the database
    console.log('\n4. Checking existing users...');
    try {
      // This would require a direct database query or admin endpoint
      console.log('   (This would require database access to list users)');
    } catch (error) {
      console.log('   Could not check users:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to create a test user
async function createTestUser() {
  console.log('\n🔧 Creating test user...');
  
  const testUser = {
    name: 'Test Owner',
    email: 'owner@test.com',
    password: 'password123',
    phone: '9876543210'
  };
  
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    console.log('✅ Test user created successfully!');
    console.log('   Email:', testUser.email);
    console.log('   Password:', testUser.password);
    console.log('   Token:', response.data.token.substring(0, 20) + '...');
    return response.data.token;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  Test user already exists, trying to login...');
      try {
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login successful with existing user!');
        return loginResponse.data.token;
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
        return null;
      }
    } else {
      console.log('❌ Failed to create test user:', error.response?.data?.message || error.message);
      return null;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Owner Authentication Diagnostic Tool\n');
  console.log('API Base URL:', API_BASE);
  console.log('=' * 50);
  
  // First run the auth test
  await testOwnerAuth();
  
  // If no valid credentials found, create a test user
  console.log('\n' + '=' * 50);
  console.log('🔧 SOLUTION: Creating test user for owner dashboard...');
  
  const token = await createTestUser();
  
  if (token) {
    console.log('\n✅ SUCCESS! You can now:');
    console.log('1. Use these credentials to login:');
    console.log('   Email: owner@test.com');
    console.log('   Password: password123');
    console.log('2. Or use this token directly in localStorage:');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log('3. Then refresh the owner dashboard page');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testOwnerAuth, createTestUser };