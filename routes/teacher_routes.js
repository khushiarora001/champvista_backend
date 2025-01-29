const express = require('express');
const router = express.Router();
const {
    addTeacher,
    updateTeacherDetails,
    getTeacherDetails,
    applyTeacherLeave,
    updateLeaveStatus,
} = require('../controller/teacherController');
const authenticate = require('../middleware/authenticate');

// Routes
router.post('/add', authenticate, addTeacher);
router.put('/update/:id', authenticate, updateTeacherDetails);
router.get('/:id', authenticate, getTeacherDetails);
router.post('/apply-leave', authenticate, applyTeacherLeave);
router.put('/leave-status', authenticate, updateLeaveStatus);

module.exports = router;
