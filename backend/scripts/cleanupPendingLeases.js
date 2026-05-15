const sequelize = require('../src/config/database');
const LeisureLease = require('../src/models/LeisureLease');
const { Op } = require('sequelize');

async function cleanupPendingLeases() {
  try {
    console.log('🧹 Cleaning up old pending leisure lease records...');

    // Find pending leases older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const oldPendingLeases = await LeisureLease.findAll({
      where: {
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: {
          [Op.lt]: oneHourAgo
        }
      },
      attributes: ['id', 'leaseYear', 'listingId', 'totalAmount', 'createdAt']
    });

    console.log(`Found ${oldPendingLeases.length} old pending lease records (older than 1 hour)`);

    if (oldPendingLeases.length === 0) {
      console.log('No old pending leases to clean up.');
      return;
    }

    console.log('\n📋 Old Pending Leases to Remove:');
    console.log('================================');
    oldPendingLeases.forEach((lease, index) => {
      console.log(`${index + 1}. Lease ID: ${lease.id}`);
      console.log(`   Property ID: ${lease.listingId}`);
      console.log(`   Year: ${lease.leaseYear}`);
      console.log(`   Amount: ₹${lease.totalAmount}`);
      console.log(`   Created: ${lease.createdAt}`);
      console.log('---');
    });

    // Delete old pending leases
    const deletedCount = await LeisureLease.destroy({
      where: {
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: {
          [Op.lt]: oneHourAgo
        }
      }
    });

    console.log(`✅ Deleted ${deletedCount} old pending lease records`);

    // Show remaining leases
    const remainingLeases = await LeisureLease.findAll({
      attributes: ['id', 'leaseYear', 'paymentStatus', 'status', 'listingId', 'totalAmount']
    });

    console.log('\n📋 Remaining Leisure Lease Records:');
    console.log('===================================');
    remainingLeases.forEach((lease, index) => {
      const statusIcon = lease.status === 'active' && lease.paymentStatus === 'paid' ? '✅' : 
                        lease.status === 'pending' ? '⏳' : '❌';
      console.log(`${index + 1}. ${statusIcon} Lease ID: ${lease.id}`);
      console.log(`   Property ID: ${lease.listingId}`);
      console.log(`   Year: ${lease.leaseYear}`);
      console.log(`   Payment Status: ${lease.paymentStatus}`);
      console.log(`   Status: ${lease.status}`);
      console.log(`   Amount: ₹${lease.totalAmount}`);
      console.log('---');
    });

    console.log('\n🎉 Cleanup completed!');
    console.log('\n📝 Benefits:');
    console.log('  • Removed failed payment attempts');
    console.log('  • Properties are now available for new lease attempts');
    console.log('  • Only confirmed paid leases remain active');

  } catch (error) {
    console.error('❌ Error cleaning up pending leases:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
cleanupPendingLeases();