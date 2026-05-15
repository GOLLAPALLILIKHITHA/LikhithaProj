const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const PropertyRental = require('../src/models/PropertyRental');
const emailService = require('../src/services/emailService');

async function sendRentNotificationEmail() {
  try {
    console.log('📧 Sending rent notification email...\n');

    // 1. Find user
    const user = await User.findOne({
      where: { email: 'sekharravi406@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.name);

    // 2. Find user's rental
    const rental = await PropertyRental.findOne({
      where: { 
        userId: user.id,
        status: 'active'
      },
      include: [
        {
          model: Listing,
          as: 'property',
          attributes: ['id', 'title', 'location', 'city']
        }
      ]
    });

    if (!rental) {
      console.log('❌ No active rental found');
      process.exit(1);
    }

    console.log('✅ Rental found:', rental.property.title);
    console.log('   Status:', rental.monthlyPaymentStatus);

    // 3. Test email connection
    console.log('\n📡 Testing email connection...');
    const isConnected = await emailService.testConnection();
    
    if (!isConnected) {
      console.log('\n⚠️  Email service not configured properly!');
      console.log('📝 To enable email notifications:');
      console.log('   1. Go to your Gmail account');
      console.log('   2. Enable 2-Factor Authentication');
      console.log('   3. Generate an App Password');
      console.log('   4. Update EMAIL_PASSWORD in .env file');
      console.log('\n💡 For now, showing email preview...\n');
    }

    // 4. Send appropriate email based on status
    let result;
    if (rental.monthlyPaymentStatus === 'overdue') {
      console.log('\n🚨 Sending OVERDUE warning email...');
      result = await emailService.sendOverdueWarning(user, rental.property, rental);
    } else {
      console.log('\n💰 Sending rent due reminder email...');
      result = await emailService.sendRentDueReminder(user, rental.property, rental);
    }

    if (result.success) {
      console.log('\n✅ Email sent successfully!');
      console.log('   To:', user.email);
      console.log('   Subject:', rental.monthlyPaymentStatus === 'overdue' ? 
        '🚨 URGENT: Rent Payment OVERDUE' : 
        '💰 Rent Payment Reminder');
      console.log('   Message ID:', result.messageId);
    } else {
      console.log('\n❌ Failed to send email:', result.error);
      console.log('\n📧 Email Preview:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('To:', user.email);
      console.log('Subject:', rental.monthlyPaymentStatus === 'overdue' ? 
        '🚨 URGENT: Rent Payment OVERDUE - INFRAALL' : 
        '💰 Rent Payment Reminder - INFRAALL');
      console.log('\nMessage:');
      console.log(`Hello ${user.name},`);
      console.log('');
      if (rental.monthlyPaymentStatus === 'overdue') {
        console.log('⚠️ YOUR RENT PAYMENT IS OVERDUE!');
        console.log('YOU HAVE TO PAY THE RENT IMMEDIATELY!');
      } else {
        console.log('Your monthly rent payment is due soon.');
      }
      console.log('');
      console.log('Property:', rental.property.title);
      console.log('Location:', rental.property.location + ', ' + rental.property.city);
      console.log('Amount Due: ₹' + rental.monthlyRent);
      console.log('Due Date:', new Date(rental.nextPaymentDue).toLocaleDateString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Tenant:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🏠 Property:', rental.property.title);
    console.log('💰 Amount: ₹' + rental.monthlyRent);
    console.log('📅 Status:', rental.monthlyPaymentStatus.toUpperCase());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

sendRentNotificationEmail();
