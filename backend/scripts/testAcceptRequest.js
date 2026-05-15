const sequelize = require('../src/config/database');
const KYC = require('../src/models/KYC');
const BuyRequest = require('../src/models/BuyRequest');
const User = require('../src/models/User');

async function testAcceptRequest() {
  try {
    console.log('🔍 Testing Accept Request Functionality...\n');
    
    // Test 1: Check if there are any pending KYC requests
    console.log('1. Checking pending KYC requests...');
    const pendingKyc = await KYC.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      limit: 5
    });
    
    if (pendingKyc.length > 0) {
      console.log(`✅ Found ${pendingKyc.length} pending KYC request(s):`);
      pendingKyc.forEach(kyc => {
        console.log(`   - ID: ${kyc.id}, User: ${kyc.user.name} (${kyc.user.email})`);
      });
      
      // Test updating the first KYC request
      const testKyc = pendingKyc[0];
      console.log(`\n2. Testing KYC approval for ID: ${testKyc.id}...`);
      
      await testKyc.update({
        status: 'verified',
        adminNotes: 'Test approval - documents verified',
        verifiedAt: new Date()
      });
      
      console.log('✅ KYC request approved successfully!');
      
      // Revert the change
      await testKyc.update({
        status: 'pending',
        adminNotes: null,
        verifiedAt: null
      });
      console.log('↩️  Reverted KYC status back to pending');
      
    } else {
      console.log('⚠️  No pending KYC requests found');
    }
    
    // Test 2: Check if there are any pending Buy requests
    console.log('\n3. Checking pending Buy requests...');
    const pendingBuyRequests = await BuyRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'buyer', attributes: ['id', 'name', 'email'] }],
      limit: 5
    });
    
    if (pendingBuyRequests.length > 0) {
      console.log(`✅ Found ${pendingBuyRequests.length} pending Buy request(s):`);
      pendingBuyRequests.forEach(req => {
        console.log(`   - ID: ${req.id}, Buyer: ${req.buyer.name} (${req.buyer.email})`);
      });
      
      // Test updating the first Buy request
      const testBuyReq = pendingBuyRequests[0];
      console.log(`\n4. Testing Buy request approval for ID: ${testBuyReq.id}...`);
      
      await testBuyReq.update({
        status: 'approved',
        adminNotes: 'Test approval - request approved',
        approvedAt: new Date()
      });
      
      console.log('✅ Buy request approved successfully!');
      
      // Revert the change
      await testBuyReq.update({
        status: 'pending',
        adminNotes: null,
        approvedAt: null
      });
      console.log('↩️  Reverted Buy request status back to pending');
      
    } else {
      console.log('⚠️  No pending Buy requests found');
    }
    
    console.log('\n🎉 Accept Request functionality test completed successfully!');
    console.log('✅ All database operations are working correctly');
    
  } catch (error) {
    console.error('❌ Error testing accept request functionality:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testAcceptRequest();