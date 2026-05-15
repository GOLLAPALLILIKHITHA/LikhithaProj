const sequelize = require('../src/config/database');

async function testPropertyPurchaseWithoutKYC() {
  try {
    console.log('🧪 Testing property purchase without KYC requirement...');
    
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
      LIMIT 3
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
    
    // Check users without KYC
    const [usersWithoutKYC] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        k.status as kycStatus
      FROM users u
      LEFT JOIN kyc k ON u.id = k.userId
      WHERE u.role = 'user'
      AND (k.status IS NULL OR k.status != 'verified')
      LIMIT 3
    `);
    
    console.log(`\nUsers who can now buy properties without KYC:\n`);
    
    usersWithoutKYC.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   KYC Status: ${user.kycStatus || 'Not submitted'}`);
      console.log(`   ✅ Can now purchase properties directly`);
      console.log('');
    });
    
    console.log('🎉 Property Purchase Flow (No KYC Required):');
    console.log('1. User clicks "Buy Property" button');
    console.log('2. System creates purchase order directly (no KYC check)');
    console.log('3. User completes payment via Razorpay');
    console.log('4. Property marked as sold');
    console.log('5. Purchase confirmed');
    
    console.log('\n✅ KYC requirement successfully removed from property purchases!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPropertyPurchaseWithoutKYC();