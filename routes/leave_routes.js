const express = require('express');
const router = express.Router();
const {
    getPendingLeaves,
    getProcessedLeaves,
    approveLeave,
    rejectLeave
} = require('../controller/leaveController');
const authenticate = require('../middleware/authenticate');

// Routes
router.get('/pending', authenticate, getPendingLeaves);
router.get('/processed', authenticate, getProcessedLeaves);
router.put('/approve/:id', authenticate, approveLeave);
router.put('/reject/:id', authenticate, rejectLeave);

module.exports = router;
