const express = require('express');
const router = express.Router();
const {
    addClass,
    updateClass,
    deleteClass,
    viewTimetable,
    getTeacherAllocations,
    assignSubjects,
    getClassList,
    updateTimetable,
    createTimetable,
    deleteTimetable,
    getclassbyschool
} = require('../controller/classController');
const authenticate = require('../middleware/authenticate');

// Routes
router.post('/add', authenticate, addClass);
router.put('/update/:id', authenticate, updateClass);
router.delete('/delete/:classId', authenticate, deleteClass);
router.get('/timetable/:classId/:sectionId', authenticate, viewTimetable);
router.get('/classes/teacherallocation/:teacherId', authenticate, getTeacherAllocations);
router.post('/timetable/create/:classId/:sectionId', authenticate, createTimetable);
router.post('/timetable/delete/:classId/:sectionId', authenticate, deleteTimetable);
router.put('timetable/change/:classId/:sectionId', authenticate, updateTimetable)
router.post('/assign-subject', authenticate, assignSubjects);
router.get('/classes/:schoolEmail', authenticate, getClassList);
router.get("/classes/onlysection/:schoolEmail", authenticate, getclassbyschool);
module.exports = router;
