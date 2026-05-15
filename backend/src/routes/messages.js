const router = require('express').Router();
const { getConversations, sendMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.get('/', auth, getConversations);
router.post('/', auth, sendMessage);

module.exports = router;

