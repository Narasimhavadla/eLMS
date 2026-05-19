const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['mentor', 'admin']), analyticsController.getPlatformAnalytics);

module.exports = router;
