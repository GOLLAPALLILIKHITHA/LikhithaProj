const sequelize = require('../src/config/database');

async function addMissingPurchaseColumns() {
  try {
    console.log('🔄 Adding missing columns to purchases table...');
    
    // Get the queryInterface from sequelize
    const queryInterface = sequelize.getQueryInterface();
    
    // Check and add vacateRequested column
    const columns = await queryInterface.describeTable('purchases');
    
    if (!columns.vacateRequested) {
      await queryInterface.addColumn('purchases', 'vacateRequested', {
        type: require('sequelize').DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
        comment: 'Whether user has requested to vacate/return furniture'
      });
      console.log('✅ Added vacateRequested column');
    } else {
      console.log('✓ vacateRequested column already exists');
    }
    
    if (!columns.vacateDate) {
      await queryInterface.addColumn('purchases', 'vacateDate', {
        type: require('sequelize').DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Requested vacate/return date'
      });
      console.log('✅ Added vacateDate column');
    } else {
      console.log('✓ vacateDate column already exists');
    }
    
    if (!columns.vacateReason) {
      await queryInterface.addColumn('purchases', 'vacateReason', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for vacate/return request'
      });
      console.log('✅ Added vacateReason column');
    } else {
      console.log('✓ vacateReason column already exists');
    }
    
    if (!columns.rentalStartDate) {
      await queryInterface.addColumn('purchases', 'rentalStartDate', {
        type: require('sequelize').DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Start date of furniture rental'
      });
      console.log('✅ Added rentalStartDate column');
    } else {
      console.log('✓ rentalStartDate column already exists');
    }
    
    if (!columns.rentalEndDate) {
      await queryInterface.addColumn('purchases', 'rentalEndDate', {
        type: require('sequelize').DataTypes.DATEONLY,
        allowNull: true,
        comment: 'End date of furniture rental'
      });
      console.log('✅ Added rentalEndDate column');
    } else {
      console.log('✓ rentalEndDate column already exists');
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

addMissingPurchaseColumns();
