const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 👈 Section ID added
    timetable: {
        type: Map,
        of: [
            {
                subject: String,
                startTime: String,
                endTime: String,

            }
        ],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Timetable", TimetableSchema);
