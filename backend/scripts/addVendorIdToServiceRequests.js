/**
 * Adds vendor assignment columns to ServiceRequests for the vendor portal.
 * Safe to run multiple times (skips if columns already exist).
 */
const sequelize = require('../src/config/database');

async function run() {
  try {
    await sequelize.query(`
      ALTER TABLE ServiceRequests
      ADD COLUMN vendorId INT NULL COMMENT 'Vendor assigned by admin'
    `);
    console.log('Added vendorId column');
  } catch (e) {
    if (String(e.message).includes('Duplicate column')) {
      console.log('vendorId column already exists');
    } else {
      throw e;
    }
  }

  try {
    await sequelize.query(`
      ALTER TABLE ServiceRequests
      ADD COLUMN assignedAt DATETIME NULL COMMENT 'When admin assigned the job'
    `);
    console.log('Added assignedAt column');
  } catch (e) {
    if (String(e.message).includes('Duplicate column')) {
      console.log('assignedAt column already exists');
    } else {
      throw e;
    }
  }

  try {
    await sequelize.query(`
      ALTER TABLE ServiceRequests
      ADD CONSTRAINT service_requests_vendor_fk
      FOREIGN KEY (vendorId) REFERENCES Vendors(id) ON DELETE SET NULL
    `);
    console.log('Added foreign key service_requests_vendor_fk');
  } catch (e) {
    if (String(e.message).includes('Duplicate') || String(e.message).includes('already exists')) {
      console.log('Foreign key already exists or skipped');
    } else {
      throw e;
    }
  }

  console.log('Done.');
}

run().finally(() => sequelize.close());
