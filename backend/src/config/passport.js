const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google email
        let user = await User.findOne({ where: { email: profile.emails[0].value } });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // User doesn't exist, store profile temporarily for phone verification
        // We'll create the user after phone OTP verification
        return done(null, {
          isNewGoogleUser: true,
          googleProfile: {
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            googleId: profile.id
          }
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
