const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
require('dotenv').config();

const sequelize = require('./config/database');
const setupSocket = require('./socket/chat');
const RentalCronService = require('./services/rentalCronService');

// Import models to register associations
require('./models/User');
require('./models/Listing');
require('./models/Message');
require('./models/Review');
require('./models/Wishlist');
require('./models/Subscription');
require('./models/VisitBooking');
require('./models/PropertyRental');
require('./models/MonthlyPayment');
require('./models/Purchase');
require('./models/KYC');
require('./models/BuyRequest');
require('./models/RentalAgreement');
require('./models/RentPayment');
require('./models/RentNotification');
require('./models/Vendor');
require('./models/ServiceRequest');
require('./models/LeisureLease');

// Import associations to ensure they are loaded
require('./models/associations');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'infraall_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Disable caching for API responses
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/visit-bookings', require('./routes/visitBooking'));
app.use('/api/property-rentals', require('./routes/propertyRental'));
app.use('/api/purchase', require('./routes/purchase'));
app.use('/api/buy-requests', require('./routes/buyRequest'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/rental', require('./routes/rental'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/leisure-lease', require('./routes/leisureLease'));
app.use('/api/service-requests', require('./routes/serviceRequest'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/owner', require('./routes/owner'));

app.get('/', (req, res) => res.json({ message: 'INFRAALL API running' }));

setupSocket(io);

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`INFRAALL server running on port ${PORT}`);
    
    // Start rental management cron jobs
    RentalCronService.start();
  });
}).catch((err) => console.error('DB connection failed:', err));

