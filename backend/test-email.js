require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD 
  }
});

const tenant = { name: 'Siva Prasad', email: 'sekharravi406@gmail.com' };
const property = { 
  title: '1 BHK Studio Apartment for Rent in HSR Layout', 
  location: 'HSR Layout Sector 2', 
  city: 'Bangalore' 
};
const rental = { monthlyRent: 5000, nextPaymentDue: '2026-07-08' };

const mailOptions = {
  from: process.env.EMAIL_FROM,
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

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.log('❌ Email FAILED:', err.message);
  } else {
    console.log('✅ Rent reminder email SENT to sekharravi406@gmail.com!');
    console.log('MessageId:', info.messageId);
    console.log('\nCheck the inbox at sekharravi406@gmail.com (including spam folder)');
  }
  process.exit(0);
});
