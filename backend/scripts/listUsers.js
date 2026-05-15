require('dotenv').config();
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isVerified', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log('\n📋 All Users in Database:');
    console.log('=' .repeat(80));
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👑 Role: ${user.role}`);
        console.log(`   ✅ Verified: ${user.isVerified}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('   ' + '-'.repeat(50));
      });
    }

    console.log(`\nTotal users: ${users.length}`);
    
    // Count by role
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;
    const sellerCount = users.filter(u => u.role === 'seller').length;
    
    console.log(`👑 Admins: ${adminCount}`);
    console.log(`👤 Users: ${userCount}`);
    console.log(`🏪 Sellers: ${sellerCount}`);

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    await sequelize.close();
  }
}

listUsers();