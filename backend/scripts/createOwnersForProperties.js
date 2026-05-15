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

// Owner accounts to create
const owners = [
  {
    name: 'Siva Kumar',
    email: 'sivakumar@gmail.com',
    password: 'owner123',
    phone: '9876543210',
    propertyIds: [2] // Siva House
  },
  {
    name: 'Rajesh Sharma',
    email: 'rajeshsharma@gmail.com',
    password: 'owner123',
    phone: '9876543211',
    propertyIds: [14] // Modern Test Apartment
  },
  {
    name: 'Priya Reddy',
    email: 'priyareddy@gmail.com',
    password: 'owner123',
    phone: '9876543213',
    propertyIds: [16] // Likhitha House
  },
  {
    name: 'Vikram Patel',
    email: 'vikrampatel@gmail.com',
    password: 'owner123',
    phone: '9876543214',
    propertyIds: [17] // lIKKI HOUSE
  },
  {
    name: 'Anita Desai',
    email: 'anitadesai@gmail.com',
    password: 'owner123',
    phone: '9876543215',
    propertyIds: [15] // Sekhar Test House
  },
  {
    name: 'Furniture Store Owner',
    email: 'furniturestore@gmail.com',
    password: 'owner123',
    phone: '9876543216',
    propertyIds: [7, 8] // Ariel Sofa, Reliable chair
  },
  {
    name: 'Property Developer',
    email: 'propertydeveloper@gmail.com',
    password: 'owner123',
    phone: '9876543217',
    propertyIds: [9] // Abendment Hosue
  }
];

async function createOwnersForProperties() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          CREATING OWNER ACCOUNTS FOR PROPERTIES                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    for (const owner of owners) {
      console.log(`\n📝 Processing: ${owner.name} (${owner.email})`);
      console.log('─'.repeat(80));

      // Check if user already exists
      const [existingUsers] = await sequelize.query(`
        SELECT id, email FROM users WHERE email = '${owner.email}'
      `);

      let userId;
      if (existingUsers.length > 0) {
        console.log(`   ⚠️  User already exists (ID: ${existingUsers[0].id})`);
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
        console.log(`   ✅ User account created (ID: ${userId})`);
      }

      // Update properties with owner information
      for (const propertyId of owner.propertyIds) {
        // Get property details
        const [properties] = await sequelize.query(`
          SELECT id, title, contactEmail FROM listings WHERE id = ${propertyId}
        `);

        if (properties.length === 0) {
          console.log(`   ❌ Property ID ${propertyId} not found`);
          continue;
        }

        const property = properties[0];
        
        if (property.contactEmail && property.contactEmail !== '') {
          console.log(`   ⚠️  Property "${property.title}" already has owner email: ${property.contactEmail}`);
        } else {
          // Update property with owner details
          await sequelize.query(`
            UPDATE listings 
            SET 
              contactEmail = '${owner.email}',
              contactPerson = '${owner.name}',
              contactPhone = '${owner.phone}',
              userId = ${userId}
            WHERE id = ${propertyId}
          `);
          
          console.log(`   ✅ Updated property: "${property.title}" (ID: ${propertyId})`);
        }
      }

      console.log(`\n   📊 Summary for ${owner.name}:`);
      console.log(`      Email: ${owner.email}`);
      console.log(`      Password: ${owner.password}`);
      console.log(`      Properties: ${owner.propertyIds.length}`);
    }

    // Final summary
    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    OWNER ACCOUNTS CREATED                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📝 LOGIN CREDENTIALS:\n');
    owners.forEach((owner, index) => {
      console.log(`${index + 1}. ${owner.name}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Password: ${owner.password}`);
      console.log(`   Properties: ${owner.propertyIds.length}`);
      console.log('');
    });

    console.log('🔗 Login URL: http://localhost:5173/owner/login\n');

    // Verify all properties now have owners
    console.log('═'.repeat(80));
    console.log('VERIFICATION: Properties with Owner Emails\n');

    const [allProperties] = await sequelize.query(`
      SELECT 
        id, 
        title, 
        contactEmail, 
        contactPerson,
        CASE 
          WHEN contactEmail IS NOT NULL AND contactEmail != '' THEN '✅'
          ELSE '❌'
        END as has_owner
      FROM listings
      WHERE id IN (2, 14, 16, 17, 15, 7, 8, 9)
      ORDER BY id
    `);

    allProperties.forEach(prop => {
      console.log(`${prop.has_owner} ${prop.title} (ID: ${prop.id})`);
      if (prop.contactEmail) {
        console.log(`   Owner: ${prop.contactPerson} (${prop.contactEmail})`);
      }
      console.log('');
    });

    await sequelize.close();
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await sequelize.close();
  }
}

createOwnersForProperties();
