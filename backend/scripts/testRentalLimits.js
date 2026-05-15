const sequelize = require('../src/config/database');

async function testRentalLimits() {
  try {
    console.log('🧪 Testing rental payment limits...');
    
    // Test different monthly rent amounts
    const testAmounts = [15000, 20000, 25000, 30000, 35000, 40000];
    const RAZORPAY_TEST_LIMIT = 50000;
    
    console.log('\n📊 Payment Calculations:');
    console.log('Monthly Rent | Standard Payment (2+1) | Reduced Payment (1+1) | Status');
    console.log('-------------|---------------------|---------------------|--------');
    
    testAmounts.forEach(monthlyRent => {
      // Standard: 2 months advance + 1 month rent
      const standardPayment = monthlyRent * 3;
      
      // Reduced: 1 month advance + 1 month rent  
      const reducedPayment = monthlyRent * 2;
      
      const standardStatus = standardPayment <= RAZORPAY_TEST_LIMIT ? '✅ OK' : '❌ EXCEEDS';
      const reducedStatus = reducedPayment <= RAZORPAY_TEST_LIMIT ? '✅ OK' : '❌ EXCEEDS';
      
      console.log(`₹${monthlyRent.toLocaleString().padEnd(8)} | ₹${standardPayment.toLocaleString().padEnd(18)} | ₹${reducedPayment.toLocaleString().padEnd(18)} | ${standardStatus}`);
      
      if (standardPayment > RAZORPAY_TEST_LIMIT && reducedPayment <= RAZORPAY_TEST_LIMIT) {
        console.log(`             → Use reduced payment option for ₹${monthlyRent.toLocaleString()}/month properties`);
      } else if (reducedPayment > RAZORPAY_TEST_LIMIT) {
        console.log(`             → Requires live payment gateway for ₹${monthlyRent.toLocaleString()}/month properties`);
      }
    });
    
    console.log('\n🎯 Recommendations:');
    console.log(`• Properties ≤ ₹16,666/month: Use standard payment (3 months total)`);
    console.log(`• Properties ₹16,667-₹25,000/month: Use reduced payment (2 months total)`);
    console.log(`• Properties > ₹25,000/month: Requires live payment gateway`);
    
    console.log('\n💡 Current Issue:');
    console.log('₹25,000/month property = ₹75,000 total (standard) → Exceeds ₹50,000 limit');
    console.log('Solution: Use reduced payment = ₹50,000 total → Within limit');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRentalLimits();