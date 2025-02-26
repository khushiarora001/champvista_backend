const express = require('express');
const router = express.Router();

const leaveController = require('../controller/leaveController');
const attendanceController = require('../controller/attendence_controller');


// Route for creating a leave request
router.post('/leave/request', leaveController.createLeaveRequest);


//Leave Routes

router.put('/leave/manage/:id', leaveController.manageLeave);
router.get('/leave/get', leaveController.getLeaveRequestList);
// Attendance Routes
// router.post('/attendance/mark', attendanceController.markAttendance);
// router.put('/attendance/update/:id', attendanceController.updateAttendance);
// router.put('/attendance/cancel/:id', attendanceController.cancelAttendance);

module.exports = router;
