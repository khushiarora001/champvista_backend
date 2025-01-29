const express = require('express');
const router = express.Router();
const { signup, login, changePassword } = require('../controller/authController');
const authenticate = require('../middleware/authenticate');
router.post('/signup', signup);
router.post('/login', login);
router.put('/change-password', authenticate, changePassword);
module.exports = router;
