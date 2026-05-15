const Message = require('../models/Message');
const User = require('../models/User');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, listingId }) => {
      try {
        const msg = await Message.create({ 
          senderId, 
          receiverId, 
          message, // Use 'message' field
          listingId,
          isRead: false
        });
        
        // Get the full message with user details
        const fullMessage = await Message.findByPk(msg.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] }
          ]
        });
        
        // Send to both users
        io.to(`user_${receiverId}`).emit('newMessage', fullMessage);
        io.to(`user_${senderId}`).emit('newMessage', fullMessage);
        
        console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;

