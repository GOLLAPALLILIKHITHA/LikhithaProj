const sequelize = require('../src/config/database');

async function createBuyRequestsTable() {
  try {
    console.log('Creating buy_requests table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS buy_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        listingId INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
        buyerMessage TEXT,
        adminNotes TEXT,
        agreementDocuments JSON DEFAULT ('[]'),
        approvedAt DATETIME NULL,
        completedAt DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (listingId) REFERENCES Listings(id) ON DELETE CASCADE,
        INDEX idx_user_id (userId),
        INDEX idx_listing_id (listingId),
        INDEX idx_status (status)
      );
    `);
    
    console.log('✅ buy_requests table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating buy_requests table:', error);
  } finally {
    await sequelize.close();
  }
}

createBuyRequestsTable();