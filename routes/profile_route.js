const express = require("express");
const { getTeacherProfile, updateTeacherProfile, getStudentProfileByEmail, updateStudentProfile } = require("../controller/profile_controller");
const router = express.Router();

router.get("/Teacher/:id", getTeacherProfile);
router.put("/Teacher/:id", updateTeacherProfile);

router.get("/Student/:email", getStudentProfileByEmail);
router.put("/Student/:id", updateStudentProfile);

module.exports = router;
