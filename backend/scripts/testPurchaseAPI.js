const sequelize = require('../src/config/database');
const Purchase = require('../src/models/Purchase');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');

async function testPurchaseAPI() {
  try {
    console.log('🔍 Testing Purchase API...\n');
    
    // Test 1: Check if there are any purchases
    console.log('1. Checking existing purchases...');
    const purchases = await Purchase.findAll({
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: Listing,
          as: 'item',
          include: [
            { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    if (purchases.length > 0) {
      console.log(`✅ Found ${purchases.length} purchase(s):`);
      purchases.forEach(purchase => {
        console.log(`   - ID: ${purchase.id}, Category: ${purchase.category}, Status: ${purchase.status}`);
        console.log(`     Buyer: ${purchase.buyer?.name || purchase.buyerName}`);
        console.log(`     Item: ${purchase.item?.title || 'N/A'}`);
        console.log(`     Amount: ₹${purchase.totalAmount}`);
      });
    } else {
      console.log('⚠️  No purchases found');
      
      // Create a sample purchase for testing
      console.log('\n2. Creating sample purchase...');
      
      // Get a user and listing
      const user = await User.findOne();
      const listing = await Listing.findOne({ where: { category: 'furniture' } });
      
      if (user && listing) {
        const samplePurchase = await Purchase.create({
          userId: user.id,
          listingId: listing.id,
          category: listing.category,
          quantity: 1,
          unitPrice: listing.price,
          totalAmount: listing.price,
          status: 'admin_review',
          paymentStatus: 'paid',
          buyerName: user.name,
          buyerEmail: user.email,
          buyerPhone: user.phone,
          notes: 'Sample purchase for testing'
        });
        
        console.log(`✅ Created sample purchase with ID: ${samplePurchase.id}`);
      } else {
        console.log('❌ Could not create sample purchase - missing user or listing');
      }
    }
    
    console.log('\n🎉 Purchase API test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Purchase API:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testPurchaseAPI();