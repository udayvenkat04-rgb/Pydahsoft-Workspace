const express = require('express');
const router = express.Router();
const { login, seedSuperAdminController } = require('../controllers/authController');

router.post('/login', login);
router.post('/seed', seedSuperAdminController);

module.exports = router;
