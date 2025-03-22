
const express = require("express");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getTeacherProfile, updateTeacherProfile, getStudentProfileByEmail, updateStudentProfile } = require("../controller/profile_controller");
const router = express.Router();

router.get("/Teacher/:id", getTeacherProfile);
router.put("/Teacher/:id", updateTeacherProfile);

router.put("Update/Teacher/:id", upload.single("photo"), updateTeacherProfile);
router.get("/Student/:email", getStudentProfileByEmail);
router.put("Update/Student/:id", upload.single("photo"), updateStudentProfile);

module.exports = router;
