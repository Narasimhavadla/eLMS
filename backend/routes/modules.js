const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['mentor', 'admin']), moduleController.createModule);
router.get('/', authenticate, moduleController.getModules);
router.get('/:id', authenticate, moduleController.getModuleById);
router.post('/:moduleId/lessons', authenticate, authorize(['mentor', 'admin']), moduleController.addLesson);
router.get('/:moduleId/lessons', authenticate, moduleController.getLessons);
router.put('/lessons/:id', authenticate, authorize(['mentor', 'admin']), moduleController.updateLesson);
router.delete('/lessons/:id', authenticate, authorize(['mentor', 'admin']), moduleController.deleteLesson);
router.patch('/:id/status', authenticate, authorize(['admin']), moduleController.toggleModuleStatus);

module.exports = router;
