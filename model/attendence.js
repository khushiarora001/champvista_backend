const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Student or Teacher ID
    userType: { type: String, enum: ["Student", "Teacher"], required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // Only for students
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" }, // Only for students
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Leave"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
