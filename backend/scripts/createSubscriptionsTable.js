const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSubscriptionsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Creating subscriptions table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        packageType ENUM('Monthly', 'Weekly', 'Yearly') NOT NULL,
        amount INT NOT NULL,
        startDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        endDate DATETIME NOT NULL,
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        razorpayOrderId VARCHAR(255),
        razorpayPaymentId VARCHAR(255),
        razorpaySignature VARCHAR(255),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Subscriptions table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createSubscriptionsTable();
