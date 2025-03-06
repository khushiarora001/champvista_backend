const express = require('express');
const router = express.Router();
const attendeacerouter = require('../controller/attendence_controller');

router.get('/get/:classId/:sectionId/:date', attendeacerouter.getAttendanceByClassSectionDate);
router.post("/mark", attendeacerouter.markAttendance);
router.get('/student/:email', attendeacerouter.getStudentAttendace);
module.exports = router;
