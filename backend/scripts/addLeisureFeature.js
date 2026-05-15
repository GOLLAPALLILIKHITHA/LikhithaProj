const sequelize = require('../src/config/database');

async function addLeisureFeature() {
  try {
    console.log('🏖️ Adding leisure feature to database...');

    // Add isLeisure column to Listings table
    await sequelize.query(`
      ALTER TABLE Listings 
      ADD COLUMN isLeisure BOOLEAN DEFAULT FALSE 
      COMMENT 'Whether this rental property can be leased for leisure purposes (full year commitment)'
    `);
    console.log('✅ Added isLeisure column to Listings table');

    // Create LeisureLeases table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS LeisureLeases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        listingId INT NOT NULL,
        leaseYear INT NOT NULL COMMENT 'Year for which the leisure lease is taken (e.g., 2024, 2025)',
        startDate DATE NOT NULL COMMENT 'Start date of the leisure lease',
        endDate DATE NOT NULL COMMENT 'End date of the leisure lease (typically 1 year from start)',
        totalAmount DECIMAL(15,2) NOT NULL COMMENT 'Total amount paid for the full year lease',
        monthlyEquivalent DECIMAL(15,2) NOT NULL COMMENT 'Monthly rent equivalent (for reference)',
        paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        paymentId VARCHAR(255) NULL COMMENT 'Razorpay payment ID',
        orderId VARCHAR(255) NULL COMMENT 'Razorpay order ID',
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        notes TEXT NULL COMMENT 'Additional notes or terms for the leisure lease',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (listingId) REFERENCES Listings(id) ON DELETE CASCADE,
        UNIQUE KEY unique_property_year_lease (listingId, leaseYear)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created LeisureLeases table');

    console.log('🎉 Leisure feature added successfully!');
    console.log('');
    console.log('📋 What was added:');
    console.log('  • isLeisure field to Listings table');
    console.log('  • LeisureLeases table for tracking full-year leases');
    console.log('  • Unique constraint to prevent double-booking same year');
    console.log('');
    console.log('🏖️ How it works:');
    console.log('  • Property owners can mark rental properties as "leisure"');
    console.log('  • Tenants can lease the entire year with upfront payment');
    console.log('  • Perfect for vacation homes and seasonal properties');
    console.log('  • Each property can only be leased once per year');

  } catch (error) {
    console.error('❌ Error adding leisure feature:', error);
    
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  isLeisure column already exists, skipping...');
    }
    
    if (error.message.includes('Table') && error.message.includes('already exists')) {
      console.log('ℹ️  LeisureLeases table already exists, skipping...');
    }
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addLeisureFeature();