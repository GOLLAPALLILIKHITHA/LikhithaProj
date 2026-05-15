const sequelize = require('../src/config/database');
const axios = require('axios');

// SMS API configuration (you can use services like Twilio, MSG91, etc.)
const SMS_CONFIG = {
  // Example for MSG91 (popular in India)
  apiKey: 'YOUR_SMS_API_KEY', // Replace with actual API key
  senderId: 'INFRAL', // Your sender ID
  route: '4', // Transactional route
  country: '91' // India country code
};

async function checkRentalNotifications() {
  try {
    console.log('🔔 Checking rental payment notifications...');
    
    // Get all active rentals that need notifications
    const [rentals] = await sequelize.query(`
      SELECT 
        r.*,
        u.name as tenantName,
        u.email as tenantEmail,
        u.phone as tenantPhone,
        l.title as propertyTitle,
        l.location as propertyLocation
      FROM property_rentals r
      LEFT JOIN users u ON r.userId = u.id
      LEFT JOIN listings l ON r.listingId = l.id
      WHERE r.status = 'active' 
      AND r.vacateRequested = false
      AND r.paidUntilDate IS NOT NULL
    `);
    
    console.log(`📊 Found ${rentals.length} active rentals to check`);
    
    const today = new Date();
    const notifications = [];
    
    for (const rental of rentals) {
      const paidUntil = new Date(rental.paidUntilDate);
      const daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let notificationType = null;
      let message = '';
      
      if (daysLeft === 3) {
        // 3 days before expiry
        notificationType = 'reminder_3_days';
        message = `Hi ${rental.tenantName}, your rental for ${rental.propertyTitle} expires in 3 days (${rental.paidUntilDate}). Please pay ₹${rental.monthlyRent.toLocaleString()} to continue. Login to pay: ${process.env.CLIENT_URL}`;
      } else if (daysLeft === 1) {
        // 1 day before expiry
        notificationType = 'reminder_1_day';
        message = `URGENT: ${rental.tenantName}, your rental for ${rental.propertyTitle} expires TOMORROW (${rental.paidUntilDate}). Pay ₹${rental.monthlyRent.toLocaleString()} now to avoid disconnection. Login: ${process.env.CLIENT_URL}`;
      } else if (daysLeft === 0) {
        // Day of expiry
        notificationType = 'expiry_today';
        message = `FINAL NOTICE: ${rental.tenantName}, your rental for ${rental.propertyTitle} expires TODAY. Pay ₹${rental.monthlyRent.toLocaleString()} immediately to continue. Login: ${process.env.CLIENT_URL}`;
      } else if (daysLeft < 0) {
        // Overdue
        const overdueDays = Math.abs(daysLeft);
        notificationType = 'overdue';
        message = `OVERDUE: ${rental.tenantName}, your rental payment is ${overdueDays} day(s) overdue. Pay ₹${rental.monthlyRent.toLocaleString()} + late fees immediately. Property: ${rental.propertyTitle}. Login: ${process.env.CLIENT_URL}`;
      }
      
      if (notificationType) {
        notifications.push({
          rentalId: rental.id,
          userId: rental.userId,
          tenantName: rental.tenantName,
          tenantEmail: rental.tenantEmail,
          tenantPhone: rental.tenantPhone,
          propertyTitle: rental.propertyTitle,
          daysLeft,
          notificationType,
          message,
          amount: rental.monthlyRent
        });
      }
    }
    
    console.log(`📢 Found ${notifications.length} notifications to send`);
    
    // Send notifications
    for (const notification of notifications) {
      console.log(`\n📱 Sending notification to ${notification.tenantName}:`);
      console.log(`- Type: ${notification.notificationType}`);
      console.log(`- Days Left: ${notification.daysLeft}`);
      console.log(`- Phone: ${notification.tenantPhone}`);
      console.log(`- Message: ${notification.message}`);
      
      // Send SMS (uncomment when you have SMS API configured)
      // await sendSMS(notification.tenantPhone, notification.message);
      
      // Send Email (you can implement email sending here)
      // await sendEmail(notification.tenantEmail, 'Rental Payment Reminder', notification.message);
      
      // Log notification in database
      await logNotification(notification);
    }
    
    console.log('\n🎉 Notification check completed!');
    
  } catch (error) {
    console.error('❌ Error checking notifications:', error.message);
  }
}

async function sendSMS(phone, message) {
  try {
    // Example SMS sending (replace with your SMS provider)
    const smsData = {
      authkey: SMS_CONFIG.apiKey,
      mobiles: phone,
      message: message,
      sender: SMS_CONFIG.senderId,
      route: SMS_CONFIG.route,
      country: SMS_CONFIG.country
    };
    
    // Uncomment when you have SMS API configured
    /*
    const response = await axios.post('https://api.msg91.com/api/sendhttp.php', null, {
      params: smsData
    });
    
    console.log(`✅ SMS sent to ${phone}: ${response.data}`);
    */
    
    console.log(`📱 SMS would be sent to ${phone}: ${message.substring(0, 50)}...`);
    
  } catch (error) {
    console.error(`❌ SMS sending failed for ${phone}:`, error.message);
  }
}

async function logNotification(notification) {
  try {
    // Create notifications table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS rental_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rentalId INT NOT NULL,
        userId INT NOT NULL,
        notificationType VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        sentAt DATETIME NOT NULL,
        method ENUM('sms', 'email', 'push') DEFAULT 'sms',
        status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rental_id (rentalId),
        INDEX idx_user_id (userId),
        INDEX idx_sent_at (sentAt)
      )
    `);
    
    // Insert notification log
    await sequelize.query(`
      INSERT INTO rental_notifications (rentalId, userId, notificationType, message, sentAt, method, status)
      VALUES (?, ?, ?, ?, NOW(), 'sms', 'sent')
    `, {
      replacements: [
        notification.rentalId,
        notification.userId,
        notification.notificationType,
        notification.message
      ]
    });
    
    console.log(`📝 Logged notification for rental ${notification.rentalId}`);
    
  } catch (error) {
    console.error('❌ Error logging notification:', error.message);
  }
}

// Run the notification check
checkRentalNotifications();