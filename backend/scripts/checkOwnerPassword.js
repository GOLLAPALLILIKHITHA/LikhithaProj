const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nestbazaar',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Prasad!5002',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function checkOwnerPassword() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              CHECKING OWNER PASSWORD                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const ownerEmail = 'demoowner@gmail.com';
    const testPassword = 'owner123';

    // Get user from database
    const [users] = await sequelize.query(`
      SELECT id, name, email, password, role FROM users WHERE email = '${ownerEmail}'
    `);

    if (users.length === 0) {
      console.log('❌ User not found!\n');
      await sequelize.close();
      return;
    }

    const user = users[0];
    console.log('✅ User found:\n');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...\n`);

    // Test password
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password "owner123" is CORRECT!\n');
    } else {
      console.log('❌ Password "owner123" does NOT match!\n');
      console.log('🔧 Resetting password to "owner123"...\n');
      
      const newHash = await bcrypt.hash(testPassword, 10);
      await sequelize.query(`
        UPDATE users SET password = '${newHash}' WHERE email = '${ownerEmail}'
      `);
      
      console.log('✅ Password has been reset to "owner123"\n');
      
      // Verify again
      const [updatedUsers] = await sequelize.query(`
        SELECT password FROM users WHERE email = '${ownerEmail}'
      `);
      
      const verifyMatch = await bcrypt.compare(testPassword, updatedUsers[0].password);
      if (verifyMatch) {
        console.log('✅ Verified: Password is now working!\n');
      }
    }

    console.log('🔗 LOGIN CREDENTIALS:\n');
    console.log('─'.repeat(80));
    console.log('URL: http://localhost:5173/owner/login');
    console.log('Email: demoowner@gmail.com');
    console.log('Password: owner123\n');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

checkOwnerPassword();
