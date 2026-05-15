const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'infraall',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function createOwnerAccount() {
  try {
    console.log('\n=== CREATING OWNER ACCOUNT ===\n');

    const ownerEmail = 'amit@example.com';
    const ownerName = 'Amit Patel';
    const ownerPassword = 'owner123';
    const ownerPhone = '9876543212';

    // Check if user already exists
    const [existingUsers] = await sequelize.query(`
      SELECT id, email FROM users WHERE email = '${ownerEmail}'
    `);

    if (existingUsers.length > 0) {
      console.log(`❌ User already exists with email: ${ownerEmail}`);
      console.log(`   User ID: ${existingUsers[0].id}`);
      console.log('\n✅ You can login with:');
      console.log(`   Email: ${ownerEmail}`);
      console.log(`   Password: (your existing password)`);
      await sequelize.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create user
    const [result] = await sequelize.query(`
      INSERT INTO users (name, email, password, phone, role, createdAt, updatedAt)
      VALUES (
        '${ownerName}',
        '${ownerEmail}',
        '${hashedPassword}',
        '${ownerPhone}',
        'user',
        NOW(),
        NOW()
      )
    `);

    console.log('✅ Owner account created successfully!\n');
    console.log('📝 LOGIN CREDENTIALS:\n');
    console.log(`   Name: ${ownerName}`);
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Password: ${ownerPassword}`);
    console.log(`   Phone: ${ownerPhone}`);
    console.log(`   Role: user`);
    console.log('\n🔗 Login URL: http://localhost:5173/owner/login\n');

    // Verify the properties this owner has
    const [properties] = await sequelize.query(`
      SELECT 
        l.id, 
        l.title, 
        l.status,
        COUNT(pr.id) as rental_count
      FROM listings l
      LEFT JOIN property_rentals pr ON l.id = pr.listingId
      WHERE l.contactEmail = '${ownerEmail}'
      GROUP BY l.id
    `);

    if (properties.length > 0) {
      console.log(`📊 Properties owned by ${ownerName}:\n`);
      properties.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   Rentals: ${p.rental_count}`);
        console.log('');
      });
    }

    await sequelize.close();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

createOwnerAccount();
