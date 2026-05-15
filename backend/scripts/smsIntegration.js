// SMS Integration Example for Indian SMS providers
// You can use services like MSG91, Textlocal, Fast2SMS, etc.

const axios = require('axios');

// Example configuration for different SMS providers
const SMS_PROVIDERS = {
  // MSG91 (Popular in India)
  MSG91: {
    apiUrl: 'https://api.msg91.com/api/sendhttp.php',
    sendSMS: async (phone, message, config) => {
      const params = {
        authkey: config.apiKey,
        mobiles: phone,
        message: message,
        sender: config.senderId,
        route: '4', // Transactional route
        country: '91'
      };
      
      const response = await axios.get(config.apiUrl, { params });
      return response.data;
    }
  },
  
  // Fast2SMS (Easy to use)
  FAST2SMS: {
    apiUrl: 'https://www.fast2sms.com/dev/bulkV2',
    sendSMS: async (phone, message, config) => {
      const data = {
        route: 'v3',
        sender_id: config.senderId,
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone
      };
      
      const response = await axios.post(config.apiUrl, data, {
        headers: {
          'authorization': config.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    }
  },
  
  // Textlocal
  TEXTLOCAL: {
    apiUrl: 'https://api.textlocal.in/send/',
    sendSMS: async (phone, message, config) => {
      const data = new URLSearchParams({
        apikey: config.apiKey,
        numbers: phone,
        message: message,
        sender: config.senderId
      });
      
      const response = await axios.post(config.apiUrl, data);
      return response.data;
    }
  }
};

// Configuration - Replace with your actual SMS provider details
const SMS_CONFIG = {
  provider: 'FAST2SMS', // Change to your preferred provider
  apiKey: 'YOUR_SMS_API_KEY', // Replace with your actual API key
  senderId: 'INFRAL', // Your sender ID (6 characters)
  enabled: false // Set to true when you have configured SMS
};

async function sendRentalReminderSMS(phone, tenantName, propertyTitle, amount, daysLeft, paidUntilDate) {
  if (!SMS_CONFIG.enabled) {
    console.log(`📱 SMS disabled. Would send to ${phone}: Rental reminder for ${propertyTitle}`);
    return { success: true, message: 'SMS disabled in config' };
  }
  
  try {
    // Format phone number (remove +91 if present, ensure 10 digits)
    const formattedPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '');
    if (formattedPhone.length !== 10) {
      throw new Error('Invalid phone number format');
    }
    
    // Create message based on days left
    let message = '';
    if (daysLeft > 0) {
      message = `Hi ${tenantName}, your rental for ${propertyTitle} expires in ${daysLeft} day(s) on ${paidUntilDate}. Pay ₹${amount.toLocaleString()} to continue. Login: ${process.env.CLIENT_URL || 'https://yourwebsite.com'}`;
    } else if (daysLeft === 0) {
      message = `URGENT: ${tenantName}, your rental for ${propertyTitle} expires TODAY. Pay ₹${amount.toLocaleString()} immediately to avoid disconnection. Login: ${process.env.CLIENT_URL || 'https://yourwebsite.com'}`;
    } else {
      const overdueDays = Math.abs(daysLeft);
      message = `OVERDUE: ${tenantName}, your rental payment is ${overdueDays} day(s) overdue. Pay ₹${amount.toLocaleString()} + late fees now. Property: ${propertyTitle}. Login: ${process.env.CLIENT_URL || 'https://yourwebsite.com'}`;
    }
    
    // Send SMS using configured provider
    const provider = SMS_PROVIDERS[SMS_CONFIG.provider];
    if (!provider) {
      throw new Error(`SMS provider ${SMS_CONFIG.provider} not supported`);
    }
    
    const result = await provider.sendSMS(formattedPhone, message, {
      apiKey: SMS_CONFIG.apiKey,
      senderId: SMS_CONFIG.senderId,
      apiUrl: provider.apiUrl
    });
    
    console.log(`✅ SMS sent to ${formattedPhone}: ${result}`);
    return { success: true, result };
    
  } catch (error) {
    console.error(`❌ SMS failed for ${phone}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Example usage and testing
async function testSMSIntegration() {
  console.log('🧪 Testing SMS Integration...');
  
  // Test data
  const testData = {
    phone: '9876543210',
    tenantName: 'Sekhar Ravi',
    propertyTitle: 'Siva House',
    amount: 14000,
    daysLeft: 1,
    paidUntilDate: '2026-05-05'
  };
  
  console.log('📱 Test SMS Configuration:');
  console.log(`- Provider: ${SMS_CONFIG.provider}`);
  console.log(`- Enabled: ${SMS_CONFIG.enabled}`);
  console.log(`- Sender ID: ${SMS_CONFIG.senderId}`);
  
  const result = await sendRentalReminderSMS(
    testData.phone,
    testData.tenantName,
    testData.propertyTitle,
    testData.amount,
    testData.daysLeft,
    testData.paidUntilDate
  );
  
  console.log('📊 SMS Test Result:', result);
  
  console.log('\n📋 To enable SMS:');
  console.log('1. Sign up with SMS provider (MSG91, Fast2SMS, Textlocal)');
  console.log('2. Get API key and sender ID');
  console.log('3. Update SMS_CONFIG in this file');
  console.log('4. Set SMS_CONFIG.enabled = true');
  console.log('5. Test with your phone number');
}

// Export for use in other scripts
module.exports = {
  sendRentalReminderSMS,
  SMS_CONFIG
};

// Run test if called directly
if (require.main === module) {
  testSMSIntegration();
}