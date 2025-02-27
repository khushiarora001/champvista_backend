const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    addSchool,
    updateSchoolDetails,
    deleteSchool,
    uploadSchoolLogo,
    updatePlanExpiry,
    getSchoolList

} = require('../controller/schoolController');
const authenticate = require('../middleware/authenticate');



// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Routes
router.post('/add', authenticate, addSchool);
router.get('/list', authenticate, getSchoolList);
router.put('/update/:id', authenticate, updateSchoolDetails);
router.delete('/delete/:id', authenticate, deleteSchool);

router.post('/upload-logo', authenticate, upload.single('imageFile'), uploadSchoolLogo);
router.put('/update-plan', authenticate, updatePlanExpiry);
module.exports = router;
