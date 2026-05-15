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

// Single owner for all N/A properties
const owner = {
  name: 'Demo Owner',
  email: 'demoowner@gmail.com',
  password: 'owner123',
  phone: '9876543210'
};

async function createSingleOwnerForAll() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║       CREATING SINGLE OWNER FOR ALL N/A PROPERTIES            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Check if user already exists
    const [existingUsers] = await sequelize.query(`
      SELECT id, email FROM users WHERE email = '${owner.email}'
    `);

    let userId;
    if (existingUsers.length > 0) {
      console.log(`⚠️  User already exists: ${owner.email} (ID: ${existingUsers[0].id})\n`);
      userId = existingUsers[0].id;
    } else {
      // Create user account
      const hashedPassword = await bcrypt.hash(owner.password, 10);
      
      const [result] = await sequelize.query(`
        INSERT INTO users (name, email, password, phone, role, createdAt, updatedAt)
        VALUES (
          '${owner.name}',
          '${owner.email}',
          '${hashedPassword}',
          '${owner.phone}',
          'user',
          NOW(),
          NOW()
        )
      `);
      
      userId = result;
      console.log(`✅ User account created: ${owner.email} (ID: ${userId})\n`);
    }

    // Find all properties without owner email
    const [propertiesWithoutOwner] = await sequelize.query(`
      SELECT id, title, category, contactEmail
      FROM listings
      WHERE (contactEmail IS NULL OR contactEmail = '' OR contactEmail = 'N/A')
        AND id IN (2, 7, 8, 9, 14, 15, 16, 17)
    `);

    if (propertiesWithoutOwner.length === 0) {
      console.log('✅ All properties already have owners!\n');
    } else {
      console.log(`📝 Updating ${propertiesWithoutOwner.length} properties...\n`);
      console.log('─'.repeat(80));

      for (const property of propertiesWithoutOwner) {
        await sequelize.query(`
          UPDATE listings 
          SET 
            contactEmail = '${owner.email}',
            contactPerson = '${owner.name}',
            contactPhone = '${owner.phone}',
            userId = ${userId}
          WHERE id = ${property.id}
        `);
        
        console.log(`✅ ${property.title} (ID: ${property.id})`);
      }
    }

    // Get all properties now owned by this owner
    const [allOwnerProperties] = await sequelize.query(`
      SELECT 
        l.id, 
        l.title, 
        l.category,
        l.status,
        COUNT(DISTINCT pr.id) as rental_count,
        COUNT(DISTINCT p.id) as purchase_count
      FROM listings l
      LEFT JOIN property_rentals pr ON l.id = pr.listingId
      LEFT JOIN purchases p ON l.id = p.listingId AND p.status IN ('completed', 'approved')
      WHERE l.contactEmail = '${owner.email}'
      GROUP BY l.id
      ORDER BY l.id
    `);

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    OWNER ACCOUNT SUMMARY                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('👤 OWNER DETAILS:\n');
    console.log(`   Name: ${owner.name}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   Password: ${owner.password}`);
    console.log(`   Phone: ${owner.phone}`);
    console.log(`   Total Properties: ${allOwnerProperties.length}`);

    console.log('\n\n🏠 PROPERTIES OWNED:\n');
    console.log('─'.repeat(80));

    let totalRentals = 0;
    let totalPurchases = 0;

    allOwnerProperties.forEach((prop, index) => {
      console.log(`\n${index + 1}. ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Category: ${prop.category}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Rentals: ${prop.rental_count}`);
      console.log(`   Purchases: ${prop.purchase_count}`);
      
      totalRentals += parseInt(prop.rental_count);
      totalPurchases += parseInt(prop.purchase_count);
    });

    console.log('\n\n📊 STATISTICS:\n');
    console.log('─'.repeat(80));
    console.log(`Total Properties: ${allOwnerProperties.length}`);
    console.log(`Total Rental Transactions: ${totalRentals}`);
    console.log(`Total Purchase Transactions: ${totalPurchases}`);

    console.log('\n\n🔗 LOGIN CREDENTIALS:\n');
    console.log('─'.repeat(80));
    console.log(`URL: http://localhost:5173/owner/login`);
    console.log(`Email: ${owner.email}`);
    console.log(`Password: ${owner.password}`);

    console.log('\n\n✅ WHAT YOU CAN TEST:\n');
    console.log('─'.repeat(80));
    console.log('1. Login with the credentials above');
    console.log('2. Dashboard will show all properties statistics');
    console.log('3. My Properties will show all properties in a grid');
    console.log('4. Click "View Buyers/Tenants" on any property');
    console.log('5. See buyers/tenants with payment tracking');

    await sequelize.close();
    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

createSingleOwnerForAll();
