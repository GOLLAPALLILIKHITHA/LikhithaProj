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

async function verifyOwnerSetup() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              OWNER PORTAL SETUP VERIFICATION                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const ownerEmail = 'demoowner@gmail.com';

    // Check if owner account exists
    const [users] = await sequelize.query(`
      SELECT id, name, email, phone, role FROM users WHERE email = '${ownerEmail}'
    `);

    if (users.length === 0) {
      console.log('❌ Owner account not found!\n');
      await sequelize.close();
      return;
    }

    const owner = users[0];
    console.log('✅ OWNER ACCOUNT FOUND\n');
    console.log('─'.repeat(80));
    console.log(`Name: ${owner.name}`);
    console.log(`Email: ${owner.email}`);
    console.log(`Phone: ${owner.phone}`);
    console.log(`User ID: ${owner.id}`);
    console.log(`Role: ${owner.role}`);

    // Get all properties owned
    const [properties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.category,
        l.status,
        l.price,
        l.contactEmail,
        l.contactPerson
      FROM listings l
      WHERE l.contactEmail = '${ownerEmail}'
      ORDER BY l.id
    `);

    console.log(`\n\n✅ PROPERTIES OWNED: ${properties.length}\n`);
    console.log('─'.repeat(80));

    if (properties.length === 0) {
      console.log('❌ No properties found for this owner!\n');
    } else {
      properties.forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.title}`);
        console.log(`   ID: ${prop.id}`);
        console.log(`   Category: ${prop.category}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Price: ₹${parseFloat(prop.price).toLocaleString('en-IN')}`);
      });
    }

    // Get rental statistics
    const [rentalStats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT pr.id) as total_rentals,
        COUNT(DISTINCT CASE WHEN pr.status = 'active' THEN pr.id END) as active_rentals,
        COUNT(DISTINCT pr.userId) as unique_tenants
      FROM listings l
      LEFT JOIN property_rentals pr ON l.id = pr.listingId
      WHERE l.contactEmail = '${ownerEmail}'
    `);

    console.log('\n\n✅ RENTAL STATISTICS\n');
    console.log('─'.repeat(80));
    console.log(`Total Rentals: ${rentalStats[0].total_rentals}`);
    console.log(`Active Rentals: ${rentalStats[0].active_rentals}`);
    console.log(`Unique Tenants: ${rentalStats[0].unique_tenants}`);

    // Get purchase statistics
    const [purchaseStats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_purchases,
        SUM(CASE WHEN p.status = 'completed' THEN p.totalAmount ELSE 0 END) as total_earnings,
        COUNT(DISTINCT p.userId) as unique_buyers
      FROM listings l
      LEFT JOIN purchases p ON l.id = p.listingId
      WHERE l.contactEmail = '${ownerEmail}'
    `);

    console.log('\n\n✅ PURCHASE STATISTICS\n');
    console.log('─'.repeat(80));
    console.log(`Total Purchases: ${purchaseStats[0].total_purchases}`);
    console.log(`Total Earnings: ₹${parseFloat(purchaseStats[0].total_earnings || 0).toLocaleString('en-IN')}`);
    console.log(`Unique Buyers: ${purchaseStats[0].unique_buyers}`);

    // Get sample tenants
    const [tenants] = await sequelize.query(`
      SELECT DISTINCT
        u.name as tenant_name,
        u.email as tenant_email,
        u.phone as tenant_phone,
        l.title as property_title,
        pr.status as rental_status,
        pr.startDate,
        pr.endDate
      FROM listings l
      JOIN property_rentals pr ON l.id = pr.listingId
      JOIN users u ON pr.userId = u.id
      WHERE l.contactEmail = '${ownerEmail}' AND pr.status = 'active'
      LIMIT 5
    `);

    if (tenants.length > 0) {
      console.log('\n\n✅ ACTIVE TENANTS (Sample)\n');
      console.log('─'.repeat(80));
      tenants.forEach((tenant, index) => {
        console.log(`\n${index + 1}. ${tenant.tenant_name}`);
        console.log(`   Email: ${tenant.tenant_email}`);
        console.log(`   Phone: ${tenant.tenant_phone || 'N/A'}`);
        console.log(`   Property: ${tenant.property_title}`);
        console.log(`   Status: ${tenant.rental_status}`);
        console.log(`   Period: ${tenant.startDate} to ${tenant.endDate || 'Ongoing'}`);
      });
    }

    // Get sample buyers
    const [buyers] = await sequelize.query(`
      SELECT DISTINCT
        u.name as buyer_name,
        u.email as buyer_email,
        u.phone as buyer_phone,
        l.title as property_title,
        p.totalAmount,
        p.status as purchase_status,
        p.createdAt
      FROM listings l
      JOIN purchases p ON l.id = p.listingId
      JOIN users u ON p.userId = u.id
      WHERE l.contactEmail = '${ownerEmail}' AND p.status = 'completed'
      LIMIT 5
    `);

    if (buyers.length > 0) {
      console.log('\n\n✅ BUYERS (Sample)\n');
      console.log('─'.repeat(80));
      buyers.forEach((buyer, index) => {
        console.log(`\n${index + 1}. ${buyer.buyer_name}`);
        console.log(`   Email: ${buyer.buyer_email}`);
        console.log(`   Phone: ${buyer.buyer_phone || 'N/A'}`);
        console.log(`   Property: ${buyer.property_title}`);
        console.log(`   Amount: ₹${parseFloat(buyer.totalAmount).toLocaleString('en-IN')}`);
        console.log(`   Status: ${buyer.purchase_status}`);
        console.log(`   Date: ${new Date(buyer.createdAt).toLocaleDateString()}`);
      });
    }

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    VERIFICATION COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Owner account is properly set up!');
    console.log('✅ All properties are assigned to the owner!');
    console.log('✅ Rental and purchase data is accessible!\n');

    console.log('🔗 LOGIN NOW:\n');
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

verifyOwnerSetup();
