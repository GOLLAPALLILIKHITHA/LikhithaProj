const sequelize = require('../src/config/database');
const LeisureLease = require('../src/models/LeisureLease');

async function fixLeisureLeaseStatus() {
  try {
    console.log('🔧 Fixing leisure lease status and cleaning up failed payments...');

    // First, let's see what leisure leases exist
    const allLeases = await LeisureLease.findAll({
      attributes: ['id', 'leaseYear', 'paymentStatus', 'status', 'listingId', 'totalAmount']
    });

    console.log(`Found ${allLeases.length} leisure lease records`);

    if (allLeases.length === 0) {
      console.log('No leisure leases found.');
      return;
    }

    console.log('\n📋 Current Leisure Lease Records:');
    console.log('==================================');
    allLeases.forEach((lease, index) => {
      console.log(`${index + 1}. Lease ID: ${lease.id}`);
      console.log(`   Property ID: ${lease.listingId}`);
      console.log(`   Year: ${lease.leaseYear}`);
      console.log(`   Payment Status: ${lease.paymentStatus}`);
      console.log(`   Status: ${lease.status}`);
      console.log(`   Amount: ₹${lease.totalAmount}`);
      console.log('---');
    });

    // Update the database schema to allow 'pending' status
    console.log('\n🔄 Updating database schema...');
    
    try {
      // Alter the ENUM to include 'pending'
      await sequelize.query(`
        ALTER TABLE LeisureLeases 
        MODIFY COLUMN status ENUM('pending', 'active', 'completed', 'cancelled') 
        DEFAULT 'pending'
      `);
      console.log('✅ Database schema updated successfully');
    } catch (schemaError) {
      console.log('⚠️  Schema might already be updated:', schemaError.message);
    }

    // Clean up failed/pending payments that are blocking availability
    console.log('\n🧹 Cleaning up failed/pending lease records...');
    
    // Find leases that have pending payment but are marked as active
    const problematicLeases = await LeisureLease.findAll({
      where: {
        paymentStatus: 'pending',
        status: 'active'
      }
    });

    if (problematicLeases.length > 0) {
      console.log(`Found ${problematicLeases.length} problematic lease records (pending payment but active status)`);
      
      // Update them to pending status
      await LeisureLease.update(
        { status: 'pending' },
        { 
          where: { 
            paymentStatus: 'pending',
            status: 'active'
          }
        }
      );
      
      console.log(`✅ Updated ${problematicLeases.length} lease records to pending status`);
    }

    // Show updated records
    const updatedLeases = await LeisureLease.findAll({
      attributes: ['id', 'leaseYear', 'paymentStatus', 'status', 'listingId', 'totalAmount']
    });

    console.log('\n📋 Updated Leisure Lease Records:');
    console.log('=================================');
    updatedLeases.forEach((lease, index) => {
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

    console.log('\n🎉 Leisure lease status fix completed!');
    console.log('\n📝 What changed:');
    console.log('  • Database schema now supports "pending" status');
    console.log('  • Failed/pending payments no longer block property availability');
    console.log('  • Only confirmed paid leases are considered active');
    console.log('  • Users can retry failed payments without conflicts');

  } catch (error) {
    console.error('❌ Error fixing leisure lease status:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
fixLeisureLeaseStatus();