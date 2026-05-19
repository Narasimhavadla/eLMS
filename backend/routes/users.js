const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'mentor']), userController.getUsers);
router.patch('/:id/status', authenticate, authorize(['admin']), userController.updateUserStatus);
router.post('/assign', authenticate, authorize(['mentor', 'admin']), userController.assignModule);
router.post('/impersonate/:id', authenticate, authorize(['admin']), userController.impersonateUser);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/password', authenticate, userController.updatePassword);

module.exports = router;
