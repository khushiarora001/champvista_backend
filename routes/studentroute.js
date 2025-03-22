const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    addStudent,
    updateStudent,
    getStudentsByClassAndSection,
    manageStudentFees,
    downloadStudentPDF,
    getSchoolCalendar,
    getStudentsBySchoolEmail,
    disableStudent
} = require('../controller/studentController');

const authenticate = require('../middleware/authenticate');

// Multer storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/add', authenticate, upload.fields([{ name: 'photo' }, { name: 'idCard' }]), addStudent);
router.put('/update/:id', authenticate, upload.fields([{ name: 'photo' }, { name: 'idCard' }]), updateStudent);
router.get('/students/:classId/:sectionId', authenticate, getStudentsByClassAndSection);
router.put('/fees', authenticate, manageStudentFees);
router.put('/student/disable/:studentId', authenticate, disableStudent);
router.get('/pdf/:id', authenticate, downloadStudentPDF);
router.get('/calendar/school', authenticate, getSchoolCalendar);
router.get('/school/:schoolEmail', authenticate, getStudentsBySchoolEmail);
module.exports = router;
