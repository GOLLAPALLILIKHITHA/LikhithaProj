require('dotenv').config();
const mysql = require('mysql2/promise');

async function createServiceRequestsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Creating ServiceRequests table...');

    // Drop table if exists
    await connection.execute('DROP TABLE IF EXISTS ServiceRequests');
    console.log('Dropped old table (if existed)');

    // Create new table
    await connection.execute(`
      CREATE TABLE ServiceRequests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        serviceType VARCHAR(255) NOT NULL,
        problemDescription TEXT NOT NULL,
        userPhone VARCHAR(20) NOT NULL,
        userAddress TEXT NOT NULL,
        status ENUM('pending', 'assigned', 'completed', 'cancelled') DEFAULT 'pending',
        workerName VARCHAR(255) NULL,
        workerPhone VARCHAR(20) NULL,
        adminNotes TEXT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ ServiceRequests table created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createServiceRequestsTable();
