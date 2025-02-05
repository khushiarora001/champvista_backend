const express = require('express');
const router = express.Router();

const feeController = require('../controllers/feeController');

// Fee Routes
router.get('/fee/:studentId', feeController.getFeeDetails);  // Get fee details of a specific student
router.post('/fee', feeController.addFee);  // Add fee details for a student
router.put('/fee/payment/:studentId', feeController.makePayment);  // Make payment for a student
router.put('/fee/update/:studentId', feeController.updateFee);  // Update fee details for a student
router.get('/fee/all', feeController.getAllFees);  // Get all fees (for admin)

module.exports = router;
