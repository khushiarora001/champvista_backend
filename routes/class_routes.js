const express = require('express');
const router = express.Router();
const {
    addClass,
    updateClass,
    deleteClass,
    viewTimetable,
    viewAttendance,
    assignSubjects
} = require('../controller/classController');
const authenticate = require('../middleware/authenticate');

// Routes
router.post('/add', authenticate, addClass);
router.put('/update/:id', authenticate, updateClass);
router.delete('/delete/:id', authenticate, deleteClass);
router.get('/timetable/:id', authenticate, viewTimetable);
router.get('/attendance/:id', authenticate, viewAttendance);
router.post('/assign-subject', authenticate, assignSubjects);

module.exports = router;
