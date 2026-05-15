const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'mysql', logging: false
});
(async () => {
  try {
    await s.query("DELETE FROM kyc_documents");
    console.log('Cleared all KYC records. Users can now re-upload.');
  } catch(e) { console.error(e.message); }
  finally { s.close(); }
})();
