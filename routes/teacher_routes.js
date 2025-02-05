const express = require('express');
const router = express.Router();
const {
    addTeacher,
    getTeacherBySchoolEmail,
} = require('../controller/teacherController');
const authenticate = require('../middleware/authenticate');

// Add a teacher (Single or Multiple)
router.post('/add/teacher', authenticate, addTeacher);

// Get teacher by school email
router.get('/school/:schoolEmail', authenticate, getTeacherBySchoolEmail);

// Get teacher by ID


// Update teacher details by school mail



module.exports = router;
