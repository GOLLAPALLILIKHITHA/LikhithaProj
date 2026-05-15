const VisitBooking = require('../models/VisitBooking');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Create a new visit booking
exports.createBooking = async (req, res) => {
  try {
    const { listingId, visitDate, timeSlot, specificTime, userPhone, notes } = req.body;
    const userId = req.user.id;

    // Check if user already has an active booking for this listing
    const existingBooking = await VisitBooking.findOne({
      where: {
        userId,
        listingId,
        status: ['pending', 'confirmed']
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'You have already scheduled a visit for this property.',
        alreadyBooked: true,
        booking: existingBooking
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    
    const booking = await VisitBooking.create({
      userId,
      listingId,
      visitDate,
      timeSlot,
      specificTime,
      userPhone: userPhone || user.phone,
      userEmail: user.email,
      notes,
      status: 'pending'
    });

    // Fetch the complete booking with associations
    const completeBooking = await VisitBooking.findByPk(booking.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'location', 'city', 'price'] }
      ]
    });

    res.status(201).json({
      message: 'Visit booking created successfully',
      booking: completeBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, listingId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (listingId) where.listingId = listingId;

    const bookings = await VisitBooking.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'email', 'phone'] 
        },
        { 
          model: Listing, 
          as: 'listing',
          attributes: ['id', 'title', 'location', 'city', 'state', 'price', 'category'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

// Get user's own bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await VisitBooking.findAll({
      where: { userId },
      include: [
        { 
          model: Listing, 
          as: 'listing',
          attributes: ['id', 'title', 'location', 'city', 'price', 'images']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

// Update booking status (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const booking = await VisitBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status || booking.status;
    booking.adminNotes = adminNotes || booking.adminNotes;
    await booking.save();

    const updatedBooking = await VisitBooking.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Listing, 
          as: 'listing',
          include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone'] }]
        }
      ]
    });

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await VisitBooking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await booking.destroy();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

// Get booking statistics (Admin only)
exports.getBookingStats = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    
    const stats = await VisitBooking.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalBookings = await VisitBooking.count();
    const todayBookings = await VisitBooking.count({
      where: {
        visitDate: new Date().toISOString().split('T')[0]
      }
    });

    res.json({
      total: totalBookings,
      today: todayBookings,
      byStatus: stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
