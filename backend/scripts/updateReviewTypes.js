const Review = require('../src/models/Review');
const Listing = require('../src/models/Listing');
const sequelize = require('../src/config/database');

async function updateReviewTransactionTypes() {
  try {
    await sequelize.authenticate();
    
    const reviews = await Review.findAll({
      include: [{ model: Listing, foreignKey: 'listingId' }]
    });
    
    console.log(`Found ${reviews.length} reviews to update`);
    
    for (const review of reviews) {
      let transactionType = 'purchase'; // default
      
      if (review.Listing) {
        if (review.Listing.category === 'property_rent') {
          transactionType = 'rental';
        } else if (review.Listing.category === 'services') {
          transactionType = 'service';
        } else {
          transactionType = 'purchase';
        }
      }
      
      await review.update({ transactionType });
      console.log(`✅ Updated review for ${review.Listing?.title || 'Unknown'} - ${transactionType}`);
    }
    
    console.log('🎉 All reviews updated with transaction types!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateReviewTransactionTypes();