const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'mysql', logging: false
});
(async () => {
  try {
    // Set prices within Razorpay test mode limit (max ~₹50,000)
    await s.query("UPDATE Listings SET price = 45000 WHERE category = 'property_sell'");
    await s.query("UPDATE Listings SET price = 5000 WHERE category = 'property_rent'");
    console.log('Updated prices for Razorpay test mode');
    const [rows] = await s.query('SELECT id, title, category, price FROM Listings');
    rows.forEach(r => console.log(`${r.title}: ₹${r.price}`));
  } catch(e) { console.error(e.message); }
  finally { s.close(); }
})();
