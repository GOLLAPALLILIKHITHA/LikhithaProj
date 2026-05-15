const sequelize = require('../src/config/database');
const LeisureLease = require('../src/models/LeisureLease');
const Listing = require('../src/models/Listing');
const User = require('../src/models/User');

// Import associations to ensure they are loaded
require('../src/models/associations');

async function testAdminLeisureAPI() {
  try {
    console.log('🧪 Testing admin leisure lease API...');

    // Test the exact query used in leisureLeaseController.getAllLeisureLeases
    const leisureLeases = await LeisureLease.findAll({
      include: [
        { 
          model: Listing, 
          as: 'property',
          attributes: ['id', 'title', 'location', 'city', 'images', 'price', 'category', 'subCategory']
        },
        { 
          model: User, 
          as: 'tenant',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${leisureLeases.length} leisure lease records`);

    if (leisureLeases.length === 0) {
      console.log('No leisure leases found for admin API.');
      return;
    }

    console.log('\n📋 Leisure Leases for Admin API:');
    console.log('================================');

    // Format the data like the controller does
    const formattedLeases = leisureLeases.map(lease => ({
      id: lease.id,
      property: {
        id: lease.property.id,
        title: lease.property.title,
        location: `${lease.property.location}, ${lease.property.city}`,
        image: lease.property.images?.[0] || null,
        monthlyRent: lease.monthlyEquivalent,
        category: lease.property.category,
        subCategory: lease.property.subCategory
      },
      tenant: {
        id: lease.tenant.id,
        name: lease.tenant.name,
        email: lease.tenant.email,
        phone: lease.tenant.phone
      },
      lease: {
        year: lease.leaseYear,
        startDate: lease.startDate,
        endDate: lease.endDate,
        totalAmount: lease.totalAmount,
        monthlyEquivalent: lease.monthlyEquivalent,
        paymentStatus: lease.paymentStatus,
        status: lease.status,
        paymentId: lease.paymentId,
        orderId: lease.orderId
      },
      createdAt: lease.createdAt,
      updatedAt: lease.updatedAt
    }));

    formattedLeases.forEach((lease, index) => {
      const statusIcon = lease.lease.status === 'active' && lease.lease.paymentStatus === 'paid' ? '✅' : 
                        lease.lease.status === 'pending' ? '⏳' : '❌';
      console.log(`${index + 1}. ${statusIcon} ${lease.property.title}`);
      console.log(`   Tenant: ${lease.tenant.name} (${lease.tenant.email})`);
      console.log(`   Year: ${lease.lease.year}`);
      console.log(`   Amount: ₹${lease.lease.totalAmount} (₹${lease.lease.monthlyEquivalent}/month)`);
      console.log(`   Status: ${lease.lease.status} | Payment: ${lease.lease.paymentStatus}`);
      console.log(`   Dates: ${lease.lease.startDate} to ${lease.lease.endDate}`);
      console.log('---');
    });

    // Calculate summary
    const summary = {
      total: leisureLeases.length,
      active: leisureLeases.filter(l => l.status === 'active' && l.paymentStatus === 'paid').length,
      pending: leisureLeases.filter(l => l.status === 'pending').length,
      totalRevenue: leisureLeases
        .filter(l => l.paymentStatus === 'paid')
        .reduce((sum, l) => sum + parseFloat(l.totalAmount), 0)
    };

    console.log('\n📊 Summary for Admin:');
    console.log('====================');
    console.log(`Total Leases: ${summary.total}`);
    console.log(`Active Leases: ${summary.active}`);
    console.log(`Pending Leases: ${summary.pending}`);
    console.log(`Total Revenue: ₹${summary.totalRevenue.toLocaleString()}`);

    console.log('\n✅ Admin API data is ready!');

  } catch (error) {
    console.error('❌ Error testing admin leisure API:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Run the function
testAdminLeisureAPI();