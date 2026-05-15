const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { Op } = require('sequelize');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { 
        [Op.or]: [
          { senderId: req.user.id }, 
          { receiverId: req.user.id }
        ] 
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
        { model: Listing, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'ASC']], // Changed to ASC for proper chat order
    });
    res.json(messages);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, listingId } = req.body; // Use 'message' field
    const msg = await Message.create({ 
      senderId: req.user.id, 
      receiverId, 
      message, // Use 'message' field
      listingId,
      isRead: false
    });
    
    // Get the full message with user details
    const fullMessage = await Message.findByPk(msg.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
        { model: Listing, attributes: ['id', 'title'] }
      ]
    });
    
    res.status(201).json(fullMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: err.message });
  }
};

