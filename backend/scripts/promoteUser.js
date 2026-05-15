require('dotenv').config();
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function promoteUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/promoteUser.js user@example.com');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`✅ User ${email} is already an admin`);
      process.exit(0);
    }

    await user.update({ role: 'admin' });
    
    console.log('✅ User promoted to admin successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('👑 Role:', user.role);
    
  } catch (error) {
    console.error('❌ Error promoting user:', error.message);
  } finally {
    await sequelize.close();
  }
}

promoteUser();