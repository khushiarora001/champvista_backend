const express = require('express');
const router = express.Router();
const {
    addStudent,
    updateStudentDetails,
    getStudentDetails,
    manageStudentFees,
    downloadStudentPDF,
    getSchoolCalendar,
} = require('../controller/studentController');
const authenticate = require('../middleware/authenticate');

// Routes
router.post('/add', authenticate, addStudent);
router.put('/update/:id', authenticate, updateStudentDetails);
router.get('/:id', authenticate, getStudentDetails);
router.put('/fees', authenticate, manageStudentFees);
router.get('/pdf/:id', authenticate, downloadStudentPDF);
router.get('/calendar/school', authenticate, getSchoolCalendar);

module.exports = router;
