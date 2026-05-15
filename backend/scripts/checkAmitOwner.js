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

async function checkAmitOwner() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              AMIT OWNER ACCOUNT DETAILS                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Find Amit's user account
    const [users] = await sequelize.query(`
      SELECT id, name, email, phone, role, password FROM users 
      WHERE email LIKE '%amit%' OR name LIKE '%Amit%'
    `);

    if (users.length === 0) {
      console.log('❌ No Amit user found!\n');
      await sequelize.close();
      return;
    }

    console.log(`✅ Found ${users.length} Amit account(s):\n`);
    console.log('─'.repeat(80));

    for (const user of users) {
      console.log(`\n👤 USER ACCOUNT:`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   User ID: ${user.id}`);

      // Test password
      const testPassword = 'owner123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password "owner123": ${isMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);

      // Find properties owned by this user
      const [properties] = await sequelize.query(`
        SELECT 
          l.id,
          l.title,
          l.category,
          l.status,
          l.price,
          l.contactEmail,
          l.contactPerson,
          l.contactPhone
        FROM listings l
        WHERE l.userId = ${user.id} OR l.contactEmail = '${user.email}'
        ORDER BY l.id
      `);

      console.log(`\n🏠 PROPERTIES OWNED: ${properties.length}`);
      
      if (properties.length > 0) {
        console.log('─'.repeat(80));
        properties.forEach((prop, index) => {
          console.log(`\n${index + 1}. ${prop.title}`);
          console.log(`   ID: ${prop.id}`);
          console.log(`   Category: ${prop.category}`);
          console.log(`   Status: ${prop.status}`);
          console.log(`   Price: ₹${parseFloat(prop.price).toLocaleString('en-IN')}`);
          console.log(`   Contact: ${prop.contactPerson} (${prop.contactEmail})`);
        });

        // Get rental details
        const propertyIds = properties.map(p => p.id).join(',');
        
        const [rentals] = await sequelize.query(`
          SELECT 
            pr.id,
            pr.listingId,
            pr.status,
            pr.startDate,
            pr.endDate,
            pr.monthlyRent,
            u.name as tenant_name,
            u.email as tenant_email,
            u.phone as tenant_phone,
            l.title as property_title
          FROM property_rentals pr
          JOIN users u ON pr.userId = u.id
          JOIN listings l ON pr.listingId = l.id
          WHERE pr.listingId IN (${propertyIds})
          ORDER BY pr.startDate DESC
        `);

        if (rentals.length > 0) {
          console.log(`\n\n📋 RENTAL DETAILS: ${rentals.length} rental(s)`);
          console.log('─'.repeat(80));
          
          rentals.forEach((rental, index) => {
            console.log(`\n${index + 1}. ${rental.property_title}`);
            console.log(`   Tenant: ${rental.tenant_name}`);
            console.log(`   Email: ${rental.tenant_email}`);
            console.log(`   Phone: ${rental.tenant_phone || 'N/A'}`);
            console.log(`   Status: ${rental.status}`);
            console.log(`   Monthly Rent: ₹${parseFloat(rental.monthlyRent).toLocaleString('en-IN')}`);
            console.log(`   Period: ${rental.startDate} to ${rental.endDate || 'Ongoing'}`);
          });
        }

        // Get purchase details
        const [purchases] = await sequelize.query(`
          SELECT 
            p.id,
            p.listingId,
            p.status,
            p.totalAmount,
            p.createdAt,
            u.name as buyer_name,
            u.email as buyer_email,
            u.phone as buyer_phone,
            l.title as property_title
          FROM purchases p
          JOIN users u ON p.userId = u.id
          JOIN listings l ON p.listingId = l.id
          WHERE p.listingId IN (${propertyIds})
          ORDER BY p.createdAt DESC
        `);

        if (purchases.length > 0) {
          console.log(`\n\n💰 PURCHASE DETAILS: ${purchases.length} purchase(s)`);
          console.log('─'.repeat(80));
          
          purchases.forEach((purchase, index) => {
            console.log(`\n${index + 1}. ${purchase.property_title}`);
            console.log(`   Buyer: ${purchase.buyer_name}`);
            console.log(`   Email: ${purchase.buyer_email}`);
            console.log(`   Phone: ${purchase.buyer_phone || 'N/A'}`);
            console.log(`   Status: ${purchase.status}`);
            console.log(`   Amount: ₹${parseFloat(purchase.totalAmount).toLocaleString('en-IN')}`);
            console.log(`   Date: ${new Date(purchase.createdAt).toLocaleDateString()}`);
          });
        }
      }

      console.log('\n\n🔗 LOGIN CREDENTIALS:');
      console.log('─'.repeat(80));
      console.log(`URL: http://localhost:5173/owner/login`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: owner123`);
      console.log('─'.repeat(80));
    }

    await sequelize.close();
    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

checkAmitOwner();
