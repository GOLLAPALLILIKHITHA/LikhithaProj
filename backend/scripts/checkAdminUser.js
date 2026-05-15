require('dotenv').config();
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function checkAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email', 'role', 'isVerified']
    });

    console.log(`\n👤 Admin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`\n- ID: ${admin.id}`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Role: ${admin.role}`);
        console.log(`  Verified: ${admin.isVerified}`);
      });
    } else {
      console.log('\n⚠️  No admin users found in database!');
      console.log('\nTo create an admin user, run:');
      console.log('node scripts/createAdmin.js');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUser();
