const Purchase = require('../src/models/Purchase');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testPurchaseCreation() {
  try {
    console.log('🧪 Testing actual purchase creation process...');
    
    // Get a test listing
    const listing = await Listing.findOne({ 
      where: { category: 'property_sell' },
      include: [{ model: User, as: 'seller' }]
    });
    
    if (!listing) {
      console.log('❌ No property listings found for testing');
      process.exit(1);
    }
    
    // Get a test user
    const user = await User.findOne({ where: { role: 'user' } });
    if (!user) {
      console.log('❌ No users found for testing');
      process.exit(1);
    }
    
    console.log('📋 Test Data:');
    console.log(`Listing: ${listing.title} - ₹${listing.price}`);
    console.log(`User: ${user.name} (${user.email})`);
    
    // Test Razorpay order creation
    const totalAmount = parseFloat(listing.price);
    console.log(`\n💰 Creating Razorpay order for ₹${totalAmount.toLocaleString()}...`);
    
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        receipt: `test_purchase_${Date.now()}`,
        notes: {
          listingId: listing.id,
          userId: user.id,
          category: listing.category,
          quantity: 1
        }
      });
      
      console.log('✅ Razorpay order created successfully');
      console.log(`Order ID: ${razorpayOrder.id}`);
      
      // Test Purchase record creation
      console.log('\n📝 Creating Purchase record...');
      
      const purchase = await Purchase.create({
        userId: user.id,
        listingId: listing.id,
        category: listing.category,
        quantity: 1,
        unitPrice: totalAmount,
        totalAmount: totalAmount,
        razorpayOrderId: razorpayOrder.id,
        deliveryAddress: 'Test Address',
        deliveryCity: 'Test City',
        deliveryState: 'Test State',
        deliveryPincode: '123456',
        deliveryPhone: user.phone,
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: user.phone,
        notes: 'Test purchase',
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      console.log('✅ Purchase record created successfully');
      console.log(`Purchase ID: ${purchase.id}`);
      
      // Clean up test data
      await purchase.destroy();
      console.log('🧹 Test purchase record cleaned up');
      
      console.log('\n🎉 Purchase creation test PASSED!');
      console.log('The purchase order system is working correctly.');
      
    } catch (razorpayError) {
      console.error('❌ Razorpay error:', razorpayError.message);
      if (razorpayError.error) {
        console.error('Razorpay error details:', razorpayError.error);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testPurchaseCreation();