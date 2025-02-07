const express = require('express');
const router = express.Router();
const {
    getDashboardData,

} = require('../controller/dashboardController');
const authenticate = require('../middleware/authenticate'); // Middleware for JWT Authentication

// Dashboard Routes
router.get('/summary', authenticate, getDashboardData);

module.exports = router;
