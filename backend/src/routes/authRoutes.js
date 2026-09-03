const express = require('express');
const router = express.Router();
const { login, getMe, seedSuperAdminController } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/seed', seedSuperAdminController);
router.get('/me', protect, getMe);

module.exports = router;
