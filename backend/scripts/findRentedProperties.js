const { Sequelize } = require('sequelize');
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

async function findRentedProperties() {
  try {
    console.log('\n=== FINDING RENTED PROPERTIES WITH OWNER INFO ===\n');

    // Find properties with rentals
    const [listings] = await sequelize.query(`
      SELECT DISTINCT 
        l.id, 
        l.title, 
        l.contactEmail, 
        l.contactPerson, 
        l.contactPhone, 
        l.status, 
        l.category,
        COUNT(pr.id) as rental_count
      FROM listings l
      INNER JOIN property_rentals pr ON l.id = pr.listingId
      WHERE l.contactEmail IS NOT NULL 
        AND l.contactEmail != '' 
        AND l.contactEmail != 'demoowner@example.com'
      GROUP BY l.id
      LIMIT 10
    `);

    if (listings.length === 0) {
      console.log('❌ No rented properties found with owner emails (excluding demoowner)');
      console.log('\nTrying to find ANY rented properties...\n');
      
      const [allListings] = await sequelize.query(`
        SELECT DISTINCT 
          l.id, 
          l.title, 
          l.contactEmail, 
          l.contactPerson, 
          l.contactPhone, 
          l.status, 
          l.category,
          COUNT(pr.id) as rental_count
        FROM listings l
        INNER JOIN property_rentals pr ON l.id = pr.listingId
        GROUP BY l.id
        LIMIT 10
      `);
      
      if (allListings.length === 0) {
        console.log('❌ No rented properties found at all!');
      } else {
        console.log(`✅ Found ${allListings.length} rented properties:\n`);
        allListings.forEach((l, i) => {
          console.log(`${i + 1}. Property: ${l.title}`);
          console.log(`   ID: ${l.id}`);
          console.log(`   Status: ${l.status}`);
          console.log(`   Category: ${l.category}`);
          console.log(`   Owner Email: ${l.contactEmail || 'NOT SET'}`);
          console.log(`   Owner Name: ${l.contactPerson || 'NOT SET'}`);
          console.log(`   Owner Phone: ${l.contactPhone || 'NOT SET'}`);
          console.log(`   Rentals: ${l.rental_count}`);
          console.log('');
        });
      }
    } else {
      console.log(`✅ Found ${listings.length} rented properties with owner info:\n`);
      
      listings.forEach((l, i) => {
        console.log(`${i + 1}. Property: ${l.title}`);
        console.log(`   ID: ${l.id}`);
        console.log(`   Status: ${l.status}`);
        console.log(`   Category: ${l.category}`);
        console.log(`   Owner Email: ${l.contactEmail}`);
        console.log(`   Owner Name: ${l.contactPerson || 'N/A'}`);
        console.log(`   Owner Phone: ${l.contactPhone || 'N/A'}`);
        console.log(`   Rentals: ${l.rental_count}`);
        console.log('');
      });
    }

    // Now check if these owners have user accounts
    console.log('\n=== CHECKING FOR USER ACCOUNTS ===\n');
    
    const emails = listings.map(l => l.contactEmail).filter(e => e);
    
    if (emails.length > 0) {
      const [users] = await sequelize.query(`
        SELECT id, name, email, role, createdAt
        FROM users
        WHERE email IN (${emails.map(e => `'${e}'`).join(',')})
      `);
      
      if (users.length === 0) {
        console.log('❌ No user accounts found for these owner emails');
        console.log('\n📝 OWNER CREDENTIALS TO CREATE:\n');
        
        const uniqueEmails = [...new Set(emails)];
        uniqueEmails.forEach((email, i) => {
          const listing = listings.find(l => l.contactEmail === email);
          console.log(`${i + 1}. Email: ${email}`);
          console.log(`   Name: ${listing.contactPerson || 'Owner ' + (i + 1)}`);
          console.log(`   Password: owner123 (suggested)`);
          console.log(`   Role: user`);
          console.log('');
        });
      } else {
        console.log(`✅ Found ${users.length} user accounts:\n`);
        
        users.forEach((u, i) => {
          console.log(`${i + 1}. Name: ${u.name}`);
          console.log(`   Email: ${u.email}`);
          console.log(`   Role: ${u.role}`);
          console.log(`   Created: ${u.createdAt}`);
          console.log('');
        });
        
        console.log('\n📝 LOGIN CREDENTIALS:\n');
        users.forEach((u, i) => {
          console.log(`${i + 1}. Email: ${u.email}`);
          console.log(`   Password: (check your database or reset)`);
          console.log('');
        });
      }
    }

    await sequelize.close();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

findRentedProperties();
