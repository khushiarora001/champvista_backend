const express = require('express');
const router = express.Router();
const {
    addTeacher,
    getTeacherBySchoolEmail,
    getTeacherProfile,
    getTeacherClasses,
    disableTeacher
} = require('../controller/teacherController');
const authenticate = require('../middleware/authenticate');

// Add a teacher (Single or Multiple)
router.post('/add/teacher', authenticate, addTeacher);
router.put('/teacher/disable/:teacherId', authenticate, disableTeacher);
// Get teacher by school email
router.get('/school/:schoolEmail', authenticate, getTeacherBySchoolEmail);
router.get("/:id/profile", getTeacherProfile);

// ✅ Allocated Classes Route
router.get("/:id/classes", getTeacherClasses);
// Get teacher by ID


// Update teacher details by school mail



module.exports = router;
