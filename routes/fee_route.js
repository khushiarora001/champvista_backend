const express = require('express');
const router = express.Router();
const feeController = require('../controller/feeController');

// ✅ Get fee details for a specific student
router.get('/student/:studentEmail', feeController.getStudentFeeDetails);

// ✅ Get fee details for all students
router.get('/all/:classId/:sectionId', feeController.getAllStudentsFeeDetails);

// ✅ Add fee for a class
router.post('/class/add', feeController.addClassFee);

// ✅ Get fee details for a specific class
router.get('/class/:classId', feeController.getClassFeeDetails);

module.exports = router;