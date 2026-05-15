const { Sequelize } = require('sequelize');
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

// Single owner for ALL properties
const owner = {
  name: 'Demo Owner',
  email: 'demoowner@gmail.com',
  password: 'owner123',
  phone: '9876543210'
};

async function reassignAllToOneOwner() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║       REASSIGNING ALL PROPERTIES TO SINGLE OWNER              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Get the demoowner user ID
    const [users] = await sequelize.query(`
      SELECT id FROM users WHERE email = '${owner.email}'
    `);

    if (users.length === 0) {
      console.log('❌ Demo owner account not found! Please run createSingleOwnerForAll.js first.\n');
      await sequelize.close();
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Found owner account: ${owner.email} (ID: ${userId})\n`);

    // Get all properties that have rentals or purchases
    const [allProperties] = await sequelize.query(`
      SELECT DISTINCT l.id, l.title, l.category, l.contactEmail, l.contactPerson
      FROM listings l
      LEFT JOIN property_rentals pr ON l.id = pr.listingId
      LEFT JOIN purchases p ON l.id = p.listingId
      WHERE pr.id IS NOT NULL OR p.id IS NOT NULL
      ORDER BY l.id
    `);

    console.log(`📝 Found ${allProperties.length} properties with rentals/purchases\n`);
    console.log('─'.repeat(80));

    // Update all properties to the single owner
    for (const property of allProperties) {
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
      console.log(`   Old Owner: ${property.contactPerson || 'N/A'} (${property.contactEmail || 'N/A'})`);
      console.log(`   New Owner: ${owner.name} (${owner.email})\n`);
    }

    // Get summary of all properties now owned
    const [summary] = await sequelize.query(`
      SELECT 
        l.id, 
        l.title, 
        l.category,
        l.status,
        l.price,
        COUNT(DISTINCT pr.id) as rental_count,
        COUNT(DISTINCT p.id) as purchase_count,
        SUM(CASE WHEN p.status = 'completed' THEN p.totalAmount ELSE 0 END) as purchase_earnings,
        COUNT(DISTINCT CASE WHEN pr.status = 'active' THEN pr.id END) as active_rentals
      FROM listings l
      LEFT JOIN property_rentals pr ON l.id = pr.listingId
      LEFT JOIN purchases p ON l.id = p.listingId
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
    console.log(`   Total Properties: ${summary.length}`);

    console.log('\n\n🏠 ALL PROPERTIES:\n');
    console.log('─'.repeat(80));

    let totalRentals = 0;
    let totalPurchases = 0;
    let totalEarnings = 0;
    let totalActiveRentals = 0;

    summary.forEach((prop, index) => {
      const rentals = parseInt(prop.rental_count) || 0;
      const purchases = parseInt(prop.purchase_count) || 0;
      const earnings = parseFloat(prop.purchase_earnings) || 0;
      const activeRentals = parseInt(prop.active_rentals) || 0;

      console.log(`\n${index + 1}. ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Category: ${prop.category}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Price: ₹${parseFloat(prop.price).toLocaleString('en-IN')}`);
      console.log(`   Total Rentals: ${rentals} (${activeRentals} active)`);
      console.log(`   Total Purchases: ${purchases}`);
      if (earnings > 0) {
        console.log(`   Purchase Earnings: ₹${earnings.toLocaleString('en-IN')}`);
      }
      
      totalRentals += rentals;
      totalPurchases += purchases;
      totalEarnings += earnings;
      totalActiveRentals += activeRentals;
    });

    console.log('\n\n📊 OVERALL STATISTICS:\n');
    console.log('─'.repeat(80));
    console.log(`Total Properties: ${summary.length}`);
    console.log(`Total Rental Transactions: ${totalRentals}`);
    console.log(`Active Rentals: ${totalActiveRentals}`);
    console.log(`Total Purchase Transactions: ${totalPurchases}`);
    console.log(`Total Purchase Earnings: ₹${totalEarnings.toLocaleString('en-IN')}`);

    console.log('\n\n🔗 LOGIN CREDENTIALS:\n');
    console.log('─'.repeat(80));
    console.log(`URL: http://localhost:5173/owner/login`);
    console.log(`Email: ${owner.email}`);
    console.log(`Password: ${owner.password}`);

    console.log('\n\n✅ WHAT YOU CAN NOW TEST:\n');
    console.log('─'.repeat(80));
    console.log('1. Login with demoowner@gmail.com / owner123');
    console.log('2. Dashboard shows ALL properties statistics');
    console.log('3. My Properties shows ALL properties in grid');
    console.log('4. Click "View Buyers/Tenants" on any property');
    console.log('5. See all buyers/tenants with payment details');
    console.log('6. ALL rental and purchase data in ONE account!');

    await sequelize.close();
    console.log('\n✅ All properties reassigned successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

reassignAllToOneOwner();
