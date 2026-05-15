require('dotenv').config();
const sequelize = require('../src/config/database');
const Subscription = require('../src/models/Subscription');
const User = require('../src/models/User');

async function checkSubscriptionData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const subscriptions = await Subscription.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });

    console.log(`📊 Total subscriptions: ${subscriptions.length}\n`);

    subscriptions.forEach(sub => {
      console.log('Subscription Details:');
      console.log(`- ID: ${sub.id}`);
      console.log(`- User: ${sub.user?.name} (${sub.user?.email})`);
      console.log(`- Package: ${sub.packageType}`);
      console.log(`- Amount: ₹${sub.amount} (raw value: ${sub.amount})`);
      console.log(`- Status: ${sub.status}`);
      console.log(`- Start: ${sub.startDate}`);
      console.log(`- End: ${sub.endDate}`);
      console.log(`- Payment ID: ${sub.razorpayPaymentId}`);
      console.log(`- Order ID: ${sub.razorpayOrderId}`);
      console.log(`- Created: ${sub.createdAt}\n`);
    });

    // Test the analytics query
    const totalRevenue = await Subscription.sum('amount');
    console.log(`💰 Total Revenue (SUM): ₹${totalRevenue || 0}`);

    const revenueByPackage = await Subscription.findAll({
      attributes: [
        'packageType',
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'totalRevenue'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['packageType'],
      raw: true
    });

    console.log('\n📈 Revenue by Package:');
    revenueByPackage.forEach(pkg => {
      console.log(`- ${pkg.packageType}: ₹${pkg.totalRevenue} (${pkg.count} subscriptions)`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSubscriptionData();
