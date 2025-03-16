const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({
    classId: { type: String, required: true },
    sectionId: { type: String, required: true },
    teacherId: { type: String },
    teacherName: { type: String },
    homeworkName: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    fileUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Homework", homeworkSchema);
