const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getTotalInstitutesSummary,
    getActiveInstitutes,
    getTotalUsers,
    getTeachersOnLeave
} = require('../controller/dashboardController');
const authenticate = require('../middleware/authenticate'); // Middleware for JWT Authentication

// Dashboard Routes
router.get('/summary', authenticate, getDashboardSummary);
router.get('/institutes', authenticate, getTotalInstitutesSummary);
router.get('/active', authenticate, getActiveInstitutes);
router.get('/users', authenticate, getTotalUsers);
router.get('/teachers-leave', authenticate, getTeachersOnLeave);

module.exports = router;
