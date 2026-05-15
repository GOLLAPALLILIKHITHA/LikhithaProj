const Purchase = require('../src/models/Purchase');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function testPurchaseOrder() {
  try {
    console.log('🧪 Testing purchase order creation...');
    
    // Test if models are working
    const testListing = await Listing.findOne({ 
      where: { category: 'property_sell' },
      include: [{ model: User, as: 'seller' }]
    });
    
    if (testListing) {
      console.log('✅ Listing model works');
      console.log('✅ Seller association works');
      console.log('Sample listing:', {
        id: testListing.id,
        title: testListing.title,
        price: testListing.price,
        category: testListing.category,
        seller: testListing.seller ? testListing.seller.name : 'No seller'
      });
    } else {
      console.log('❌ No property_sell listings found');
    }
    
    // Test Purchase model
    const purchaseCount = await Purchase.count();
    console.log(`✅ Purchase model works - ${purchaseCount} purchases in DB`);
    
    // Test user model
    const testUser = await User.findOne({ where: { role: 'user' } });
    if (testUser) {
      console.log('✅ User model works');
      console.log('Sample user:', {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email
      });
    }
    
    // Check Razorpay configuration
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('\n🔑 Razorpay Configuration:');
    console.log(`Key ID: ${razorpayKeyId ? 'Set ✅' : 'Missing ❌'}`);
    console.log(`Key Secret: ${razorpayKeySecret ? 'Set ✅' : 'Missing ❌'}`);
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.log('❌ Razorpay configuration missing - this could cause purchase order failures');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testPurchaseOrder();