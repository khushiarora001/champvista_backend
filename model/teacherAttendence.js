const mongoose = require("mongoose");

const TeacherAttendanceSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
});

module.exports = mongoose.model("TeacherAttendance", TeacherAttendanceSchema);
