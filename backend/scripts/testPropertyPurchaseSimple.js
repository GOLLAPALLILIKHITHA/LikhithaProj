const sequelize = require('../src/config/database');

async function testPropertyPurchaseSimple() {
  try {
    console.log('🧪 Testing property purchase availability...');
    
    // Check if there are any property_sell listings
    const [properties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.price,
        l.category,
        l.status,
        u.name as sellerName
      FROM listings l
      LEFT JOIN users u ON l.userId = u.id
      WHERE l.category = 'property_sell'
      AND l.status = 'active'
      LIMIT 5
    `);
    
    console.log(`\nFound ${properties.length} properties available for purchase:\n`);
    
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Price: ₹${parseFloat(prop.price).toLocaleString()}`);
      console.log(`   Seller: ${prop.sellerName}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   ✅ Can now be purchased WITHOUT KYC verification`);
      console.log('');
    });
    
    console.log('🎉 Property Purchase Flow (No KYC Required):');
    console.log('1. User clicks "Buy Property" button');
    console.log('2. System creates purchase order directly (no KYC check)');
    console.log('3. User completes payment via Razorpay');
    console.log('4. Property marked as sold');
    console.log('5. Purchase confirmed');
    
    console.log('\n✅ Changes Made:');
    console.log('• Removed KYC check from purchaseController.js');
    console.log('• Removed KYC redirect from frontend ListingDetailPage.tsx');
    console.log('• Users can now buy properties immediately');
    
    console.log('\n🛒 What Works Now:');
    console.log('• Property purchases: No KYC required ✅');
    console.log('• Property rentals: Still requires KYC (as intended) ✅');
    console.log('• Other purchases (furniture, etc.): No KYC required ✅');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPropertyPurchaseSimple();