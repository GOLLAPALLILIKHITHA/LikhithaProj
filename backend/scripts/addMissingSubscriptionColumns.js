const sequelize = require('../src/config/database');

async function addMissingSubscriptionColumns() {
  try {
    console.log('🔄 Adding missing columns to subscriptions table...');
    
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('subscriptions');
    
    if (!columns.expirationWarningsSent) {
      await queryInterface.addColumn('subscriptions', 'expirationWarningsSent', {
        type: require('sequelize').DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
        comment: 'Whether expiration warning email has been sent'
      });
      console.log('✅ Added expirationWarningsSent column');
    } else {
      console.log('✓ expirationWarningsSent column already exists');
    }
    
    if (!columns.lastWarningSentAt) {
      await queryInterface.addColumn('subscriptions', 'lastWarningSentAt', {
        type: require('sequelize').DataTypes.DATE,
        allowNull: true,
        comment: 'When the last expiration warning was sent'
      });
      console.log('✅ Added lastWarningSentAt column');
    } else {
      console.log('✓ lastWarningSentAt column already exists');
    }
    
    console.log('✅ Subscriptions migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

addMissingSubscriptionColumns();
