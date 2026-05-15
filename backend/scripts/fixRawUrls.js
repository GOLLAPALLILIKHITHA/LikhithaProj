const { Sequelize } = require('sequelize');
require('dotenv').config();
const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'mysql', logging: false
});
(async () => {
  try {
    await s.query("UPDATE kyc_documents SET aadhaarUrl = CONCAT(aadhaarUrl, '.pdf') WHERE aadhaarUrl LIKE '%/raw/upload/%' AND aadhaarUrl NOT LIKE '%.pdf'");
    await s.query("UPDATE kyc_documents SET panUrl = CONCAT(panUrl, '.pdf') WHERE panUrl LIKE '%/raw/upload/%' AND panUrl NOT LIKE '%.pdf'");
    await s.query("UPDATE kyc_documents SET jobIdUrl = CONCAT(jobIdUrl, '.pdf') WHERE jobIdUrl LIKE '%/raw/upload/%' AND jobIdUrl NOT LIKE '%.pdf'");
    await s.query("UPDATE kyc_documents SET otherDocUrl = CONCAT(otherDocUrl, '.pdf') WHERE otherDocUrl LIKE '%/raw/upload/%' AND otherDocUrl NOT LIKE '%.pdf'");
    console.log('Fixed raw PDF URLs - .pdf extension added');
  } catch(e) { console.error(e.message); }
  finally { s.close(); }
})();
