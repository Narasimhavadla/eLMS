const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/complete', authenticate, authorize(['student']), progressController.markLessonComplete);
router.get('/:moduleId', authenticate, progressController.getModuleProgress);
router.get('/:moduleId/all', authenticate, authorize(['mentor', 'admin']), progressController.getAllProgress);

module.exports = router;
