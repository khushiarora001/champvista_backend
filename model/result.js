const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    classId: { type: String, required: true },
    sectionId: { type: String, required: true },
    type: { type: String, required: true }, // Exam type (e.g., Mid-term, Final)
    students: [
        {
            studentId: { type: String, required: true }, // Ensure `studentId` is mapped properly
            studentName: { type: String, required: true },
            photos: [{ type: String }], // ✅ Multiple image support
            // e.g., Passed/Failed
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);


