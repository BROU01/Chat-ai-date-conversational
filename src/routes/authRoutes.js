const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/social', authController.socialAuth);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
