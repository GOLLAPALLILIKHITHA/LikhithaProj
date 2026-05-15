const sequelize = require('../src/config/database');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Review = require('../src/models/Review');

const sampleReviews = [
  {
    rating: 5,
    comment: "Excellent property! The villa is exactly as described. Great location and the owner was very helpful throughout the process."
  },
  {
    rating: 4,
    comment: "Good apartment with nice amenities. The price is reasonable for the location. Would recommend to others."
  },
  {
    rating: 5,
    comment: "Perfect rental for working professionals. Fully furnished and well-maintained. The landlord is very responsive."
  },
  {
    rating: 4,
    comment: "Nice family house with good space. The garden is a plus point. Rent is slightly high but worth it for the area."
  },
  {
    rating: 5,
    comment: "Beautiful sofa set! Excellent quality and very comfortable. Seller was honest about the condition. Highly recommended!"
  },
  {
    rating: 4,
    comment: "Good quality bed and mattress. Delivery was on time and the seller helped with setup. Minor wear but overall satisfied."
  },
  {
    rating: 5,
    comment: "Outstanding plumbing service! Ravi solved our complex pipe issue quickly and professionally. Available 24/7 as promised."
  },
  {
    rating: 4,
    comment: "Reliable cleaning service. Lakshmi and her team do thorough work. Punctual and trustworthy. Will book again."
  },
  {
    rating: 5,
    comment: "Top quality cement! Fresh stock and good packaging. Suresh provided excellent service and competitive pricing."
  },
  {
    rating: 4,
    comment: "Good quality TMT bars. Proper certification and timely delivery. Ramesh is knowledgeable about construction materials."
  }
];

async function createSampleReviews() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get all listings
    const listings = await Listing.findAll({ order: [['id', 'ASC']] });
    console.log(`📋 Found ${listings.length} listings`);

    // Create some sample users for reviews
    const reviewUsers = [
      { name: 'Arjun Mehta', email: 'arjun@example.com', phone: '9876543301' },
      { name: 'Sneha Patel', email: 'sneha@example.com', phone: '9876543302' },
      { name: 'Rohit Sharma', email: 'rohit@example.com', phone: '9876543303' },
      { name: 'Kavya Reddy', email: 'kavya@example.com', phone: '9876543304' },
      { name: 'Deepak Kumar', email: 'deepak@example.com', phone: '9876543305' }
    ];

    // Create or get review users
    const users = [];
    for (const userData of reviewUsers) {
      let user = await User.findOne({ where: { email: userData.email } });
      if (!user) {
        user = await User.create({
          ...userData,
          password: '$2a$10$example.hash.here', // Placeholder hash
          isVerified: true
        });
        console.log(`✅ Created review user: ${user.name}`);
      }
      users.push(user);
    }

    // Clear existing reviews
    await Review.destroy({ where: {} });
    console.log('🧹 Cleared existing reviews');

    // Create reviews for each listing
    for (let i = 0; i < listings.length && i < sampleReviews.length; i++) {
      const listing = listings[i];
      const reviewData = sampleReviews[i];
      const user = users[i % users.length]; // Cycle through users

      const review = await Review.create({
        ...reviewData,
        userId: user.id,
        listingId: listing.id
      });

      console.log(`✅ Created review for "${listing.title}" by ${user.name} (${review.rating}⭐)`);
    }

    // Create some additional reviews for variety
    const additionalReviews = [
      { rating: 3, comment: "Average property. Location is good but needs some maintenance work." },
      { rating: 5, comment: "Fantastic service! Exceeded my expectations. Will definitely use again." },
      { rating: 2, comment: "Not satisfied with the quality. Expected better for the price paid." }
    ];

    for (let i = 0; i < Math.min(3, listings.length); i++) {
      const listing = listings[i];
      const reviewData = additionalReviews[i];
      const user = users[(i + 2) % users.length]; // Different users

      await Review.create({
        ...reviewData,
        userId: user.id,
        listingId: listing.id
      });

      console.log(`✅ Created additional review for "${listing.title}" by ${user.name} (${reviewData.rating}⭐)`);
    }

    console.log('\n🎉 Sample reviews created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total Reviews: ${sampleReviews.length + 3}`);
    console.log(`- Review Users: ${users.length}`);
    console.log('- Ratings: 2⭐ to 5⭐');
    console.log('\n🌐 You can now test the reviews management in admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample reviews:', error);
    process.exit(1);
  }
}

createSampleReviews();