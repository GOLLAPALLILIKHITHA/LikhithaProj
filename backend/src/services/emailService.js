const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter for sending emails
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send rent due reminder email
  async sendRentDueReminder(tenant, property, rental) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'INFRAALL Rentals <noreply@infraall.com>',
      to: tenant.email,
      subject: '💰 Rent Payment Reminder - INFRAALL',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 INFRAALL Rentals</h1>
              <p>Rent Payment Reminder</p>
            </div>
            <div class="content">
              <h2>Hello ${tenant.name},</h2>
              
              <div class="alert-box">
                <strong>⚠️ Rent Payment Due</strong><br>
                Your monthly rent payment is due soon. Please make the payment on time to avoid late fees.
              </div>

              <div class="details">
                <h3>📋 Payment Details:</h3>
                <p><strong>Property:</strong> ${property.title}</p>
                <p><strong>Location:</strong> ${property.location}, ${property.city}</p>
                <p><strong>Monthly Rent:</strong> <span class="amount">₹${rental.monthlyRent}</span></p>
                <p><strong>Due Date:</strong> ${new Date(rental.nextPaymentDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <p><strong>💡 Important:</strong> Please ensure timely payment to maintain your rental agreement.</p>
              
              <p>If you have already made the payment, please ignore this reminder.</p>

              <div class="footer">
                <p>This is an automated reminder from INFRAALL Rentals</p>
                <p>For any queries, contact us at ${process.env.ADMIN_EMAIL}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Rent reminder email sent to:', tenant.email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending rent reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send overdue payment warning email
  async sendOverdueWarning(tenant, property, rental) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'INFRAALL Rentals <noreply@infraall.com>',
      to: tenant.email,
      subject: '🚨 URGENT: Rent Payment OVERDUE - INFRAALL',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #dc2626; }
            .urgent { color: #dc2626; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 INFRAALL Rentals</h1>
              <p>URGENT: Payment Overdue</p>
            </div>
            <div class="content">
              <h2>Dear ${tenant.name},</h2>
              
              <div class="alert-box">
                <p class="urgent">⚠️ YOUR RENT PAYMENT IS OVERDUE!</p>
                <p><strong>YOU HAVE TO PAY THE RENT IMMEDIATELY!</strong></p>
              </div>

              <div class="details">
                <h3>📋 Overdue Payment Details:</h3>
                <p><strong>Property:</strong> ${property.title}</p>
                <p><strong>Location:</strong> ${property.location}, ${property.city}</p>
                <p><strong>Amount Due:</strong> <span class="amount">₹${rental.monthlyRent}</span></p>
                <p><strong>Due Date:</strong> ${new Date(rental.nextPaymentDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">OVERDUE</span></p>
              </div>

              <p><strong>⚠️ Action Required:</strong></p>
              <ul>
                <li>Please make the payment immediately to avoid late fees</li>
                <li>Continued non-payment may result in termination of your rental agreement</li>
                <li>Contact us immediately if you're facing any payment issues</li>
              </ul>

              <p><strong>📞 Contact Information:</strong></p>
              <p>Email: ${process.env.ADMIN_EMAIL}</p>

              <div class="footer">
                <p>This is an urgent automated notice from INFRAALL Rentals</p>
                <p>Please respond immediately to avoid further action</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Overdue warning email sent to:', tenant.email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending overdue warning email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send subscription expiration warning email
  async sendSubscriptionExpirationWarning(user, subscription) {
    const warningNumber = subscription.expirationWarningsSent + 1;
    const urgencyLevel = warningNumber === 3 ? 'FINAL' : `Reminder #${warningNumber}`;
    const urgencyColor = warningNumber === 3 ? '#dc2626' : '#f59e0b';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'INFRAALL <noreply@infraall.com>',
      to: user.email,
      subject: `⚠️ ${urgencyLevel} Subscription Expiration Warning - INFRAALL`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${urgencyColor} 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fef3c7; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
            .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            .warning-counter { background: ${urgencyColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 INFRAALL</h1>
              <p>Subscription Expiration Warning <span class="warning-counter">${urgencyLevel}</span></p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              
              <div class="alert-box">
                <strong>⚠️ Your Subscription is Expiring Soon!</strong><br>
                ${warningNumber === 3 ? 
                  '<strong style="color: #dc2626;">This is your FINAL reminder! Your subscription expires TODAY. Renew immediately to avoid service interruption.</strong>' : 
                  `Your INFRAALL subscription will expire in ${4 - warningNumber} days. Please renew to continue enjoying our services.`
                }
              </div>

              <div class="details">
                <p><strong>Package:</strong> ${subscription.packageType}</p>
                <p><strong>Current Period:</strong> ${new Date(subscription.startDate).toLocaleDateString('en-IN')} - ${new Date(subscription.endDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Expiry Date:</strong> <span class="amount">${new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Warning Sent:</strong> ${warningNumber}/3</p>
              </div>

              <p><strong>💡 Important:</strong> ${warningNumber === 3 ? 'Renew NOW to avoid immediate service interruption!' : 'Renew your subscription before it expires to avoid service interruption.'}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/pricing" class="button">🔄 Renew Subscription</a>
              </div>

              <p>Need help? Contact our support team at support@infraall.com</p>
              ${warningNumber === 3 ? '<p style="color: #dc2626; font-weight: bold;">⚠️ This is the final warning. After expiration, you will need to contact support to reactivate your account.</p>' : ''}
            </div>
            <div class="footer">
              <p>© 2024 INFRAALL. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Subscription expiration warning sent to:', user.email);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending subscription expiration warning:', error);
      return { success: false, error: error.message };
    }
  }

  /** Generic HTML email (used by service requests, vendor invites, etc.) */
  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'INFRAALL <noreply@infraall.com>',
        to,
        subject,
        html,
        text,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('sendEmail error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
