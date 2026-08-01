const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticate, chatController.sendMessage);
router.get('/history', authenticate, chatController.getHistory);

module.exports = router;
