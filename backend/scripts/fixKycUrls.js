const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'mysql', logging: false
});

(async () => {
  try {
    // Revert: change /raw/upload/ back to /image/upload/ — Cloudinary stores PDFs under image/upload
    await sequelize.query(
      "UPDATE kyc_documents SET aadhaarUrl = REPLACE(aadhaarUrl, '/raw/upload/', '/image/upload/') WHERE aadhaarUrl LIKE '%.pdf'"
    );
    await sequelize.query(
      "UPDATE kyc_documents SET panUrl = REPLACE(panUrl, '/raw/upload/', '/image/upload/') WHERE panUrl LIKE '%.pdf'"
    );
    await sequelize.query(
      "UPDATE kyc_documents SET jobIdUrl = REPLACE(jobIdUrl, '/raw/upload/', '/image/upload/') WHERE jobIdUrl LIKE '%.pdf'"
    );
    await sequelize.query(
      "UPDATE kyc_documents SET otherDocUrl = REPLACE(otherDocUrl, '/raw/upload/', '/image/upload/') WHERE otherDocUrl LIKE '%.pdf'"
    );
    console.log('URLs reverted to image/upload successfully');
  } catch(e) {
    console.error(e.message);
  } finally {
    sequelize.close();
  }
})();
