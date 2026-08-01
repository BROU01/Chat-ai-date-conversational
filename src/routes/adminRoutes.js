const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Toutes les routes admin nécessitent d'être authentifié ET d'être admin
router.use(authenticate, isAdmin);

router.get('/users', adminController.getUsers);
router.get('/messages', adminController.getAllMessages);
router.get('/stats', adminController.getStats);
router.patch('/users/role', adminController.updateUserRole);

// Configuration & Audit
router.get('/config', adminController.getConfig);
router.post('/config', adminController.updateConfig);
router.get('/blacklist', adminController.getBlacklist);
router.post('/blacklist', adminController.addBlacklist);
router.get('/audit', adminController.getAuditLogs);

module.exports = router;
