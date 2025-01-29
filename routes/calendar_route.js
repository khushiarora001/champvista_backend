const express = require('express');
const router = express.Router();
const {
    addCalendarEntry,
    updateCalendarEntry
} = require('../controller/calenderController');
const authenticate = require('../middleware/authenticate');

// Routes
router.post('/add', authenticate, addCalendarEntry);
router.put('/update/:id', authenticate, updateCalendarEntry);

module.exports = router;
