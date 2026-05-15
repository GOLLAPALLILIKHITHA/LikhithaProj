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

async function showRentedAndBoughtProperties() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          PROPERTIES - RENTED AND BOUGHT STATUS                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // ========== RENTED PROPERTIES ==========
    console.log('🏘️  RENTED PROPERTIES\n');
    console.log('═'.repeat(80));

    const [rentedProperties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.status,
        l.category,
        l.price,
        l.contactEmail,
        l.contactPerson,
        l.contactPhone,
        COUNT(DISTINCT pr.id) as rental_count,
        COUNT(DISTINCT pr.userId) as unique_tenants
      FROM listings l
      INNER JOIN property_rentals pr ON l.id = pr.listingId
      GROUP BY l.id
      ORDER BY rental_count DESC
    `);

    if (rentedProperties.length === 0) {
      console.log('❌ No rented properties found\n');
    } else {
      console.log(`✅ Found ${rentedProperties.length} rented properties:\n`);
      
      for (let i = 0; i < rentedProperties.length; i++) {
        const prop = rentedProperties[i];
        console.log(`${i + 1}. 📍 ${prop.title}`);
        console.log(`   Property ID: ${prop.id}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Category: ${prop.category}`);
        console.log(`   Monthly Rent: ₹${prop.price.toLocaleString('en-IN')}`);
        console.log(`   Owner: ${prop.contactPerson || 'N/A'}`);
        console.log(`   Owner Email: ${prop.contactEmail || 'N/A'}`);
        console.log(`   Owner Phone: ${prop.contactPhone || 'N/A'}`);
        console.log(`   Total Rentals: ${prop.rental_count}`);
        console.log(`   Unique Tenants: ${prop.unique_tenants}`);
        
        // Get tenant details
        const [tenants] = await sequelize.query(`
          SELECT 
            u.name as tenant_name,
            u.email as tenant_email,
            u.phone as tenant_phone,
            pr.startDate,
            pr.endDate,
            pr.status as rental_status,
            pr.monthlyRent
          FROM property_rentals pr
          INNER JOIN users u ON pr.userId = u.id
          WHERE pr.listingId = ${prop.id}
          ORDER BY pr.createdAt DESC
        `);
        
        if (tenants.length > 0) {
          console.log(`   Tenants:`);
          tenants.forEach((t, idx) => {
            console.log(`     ${idx + 1}. ${t.tenant_name} (${t.tenant_email})`);
            console.log(`        Phone: ${t.tenant_phone || 'N/A'}`);
            console.log(`        Period: ${t.startDate} to ${t.endDate || 'Ongoing'}`);
            console.log(`        Status: ${t.rental_status}`);
            console.log(`        Rent: ₹${parseFloat(t.monthlyRent).toLocaleString('en-IN')}/month`);
          });
        }
        console.log('');
      }
    }

    // ========== BOUGHT/SOLD PROPERTIES ==========
    console.log('\n🏠 BOUGHT/SOLD PROPERTIES\n');
    console.log('═'.repeat(80));

    const [boughtProperties] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.status,
        l.category,
        l.price,
        l.contactEmail,
        l.contactPerson,
        l.contactPhone,
        COUNT(DISTINCT p.id) as purchase_count,
        COUNT(DISTINCT p.userId) as unique_buyers,
        SUM(CASE WHEN p.status = 'completed' THEN p.totalAmount ELSE 0 END) as total_earnings
      FROM listings l
      INNER JOIN purchases p ON l.id = p.listingId
      WHERE p.status IN ('completed', 'approved')
      GROUP BY l.id
      ORDER BY purchase_count DESC
    `);

    if (boughtProperties.length === 0) {
      console.log('❌ No bought/sold properties found\n');
    } else {
      console.log(`✅ Found ${boughtProperties.length} bought/sold properties:\n`);
      
      for (let i = 0; i < boughtProperties.length; i++) {
        const prop = boughtProperties[i];
        console.log(`${i + 1}. 📍 ${prop.title}`);
        console.log(`   Property ID: ${prop.id}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Category: ${prop.category}`);
        console.log(`   Listed Price: ₹${prop.price.toLocaleString('en-IN')}`);
        console.log(`   Owner: ${prop.contactPerson || 'N/A'}`);
        console.log(`   Owner Email: ${prop.contactEmail || 'N/A'}`);
        console.log(`   Owner Phone: ${prop.contactPhone || 'N/A'}`);
        console.log(`   Total Purchases: ${prop.purchase_count}`);
        console.log(`   Unique Buyers: ${prop.unique_buyers}`);
        console.log(`   Total Earnings: ₹${parseFloat(prop.total_earnings || 0).toLocaleString('en-IN')}`);
        
        // Get buyer details
        const [buyers] = await sequelize.query(`
          SELECT 
            u.name as buyer_name,
            u.email as buyer_email,
            u.phone as buyer_phone,
            p.totalAmount,
            p.status as purchase_status,
            p.paymentStatus,
            p.createdAt as purchase_date
          FROM purchases p
          INNER JOIN users u ON p.userId = u.id
          WHERE p.listingId = ${prop.id}
            AND p.status IN ('completed', 'approved')
          ORDER BY p.createdAt DESC
        `);
        
        if (buyers.length > 0) {
          console.log(`   Buyers:`);
          buyers.forEach((b, idx) => {
            console.log(`     ${idx + 1}. ${b.buyer_name} (${b.buyer_email})`);
            console.log(`        Phone: ${b.buyer_phone || 'N/A'}`);
            console.log(`        Amount: ₹${parseFloat(b.totalAmount).toLocaleString('en-IN')}`);
            console.log(`        Status: ${b.purchase_status}`);
            console.log(`        Payment: ${b.paymentStatus}`);
            console.log(`        Date: ${new Date(b.purchase_date).toLocaleDateString('en-IN')}`);
          });
        }
        console.log('');
      }
    }

    // ========== SUMMARY ==========
    console.log('\n📊 SUMMARY\n');
    console.log('═'.repeat(80));
    console.log(`Total Rented Properties: ${rentedProperties.length}`);
    console.log(`Total Bought/Sold Properties: ${boughtProperties.length}`);
    
    const totalRentals = rentedProperties.reduce((sum, p) => sum + parseInt(p.rental_count), 0);
    const totalPurchases = boughtProperties.reduce((sum, p) => sum + parseInt(p.purchase_count), 0);
    const totalEarnings = boughtProperties.reduce((sum, p) => sum + parseFloat(p.total_earnings || 0), 0);
    
    console.log(`Total Rental Transactions: ${totalRentals}`);
    console.log(`Total Purchase Transactions: ${totalPurchases}`);
    console.log(`Total Earnings from Sales: ₹${totalEarnings.toLocaleString('en-IN')}`);
    console.log('');

    // ========== UNIQUE OWNERS ==========
    console.log('\n👥 UNIQUE PROPERTY OWNERS\n');
    console.log('═'.repeat(80));

    const allEmails = [
      ...rentedProperties.map(p => p.contactEmail),
      ...boughtProperties.map(p => p.contactEmail)
    ].filter(e => e && e !== '');

    const uniqueEmails = [...new Set(allEmails)];
    
    console.log(`Total Unique Owners: ${uniqueEmails.length}\n`);
    
    for (let i = 0; i < uniqueEmails.length; i++) {
      const email = uniqueEmails[i];
      const ownerProps = [
        ...rentedProperties.filter(p => p.contactEmail === email),
        ...boughtProperties.filter(p => p.contactEmail === email)
      ];
      
      const ownerName = ownerProps[0]?.contactPerson || 'Unknown';
      const ownerPhone = ownerProps[0]?.contactPhone || 'N/A';
      
      console.log(`${i + 1}. ${ownerName}`);
      console.log(`   Email: ${email}`);
      console.log(`   Phone: ${ownerPhone}`);
      console.log(`   Properties: ${ownerProps.length}`);
      
      // Check if user account exists
      const [userAccount] = await sequelize.query(`
        SELECT id, role FROM users WHERE email = '${email}'
      `);
      
      if (userAccount.length > 0) {
        console.log(`   ✅ User Account: EXISTS (ID: ${userAccount[0].id}, Role: ${userAccount[0].role})`);
      } else {
        console.log(`   ❌ User Account: NOT FOUND`);
        console.log(`   💡 Create account with: Email: ${email}, Password: owner123`);
      }
      console.log('');
    }

    await sequelize.close();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

showRentedAndBoughtProperties();
