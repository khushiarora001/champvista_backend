const mongoose = require("mongoose");

const BroadcastSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "class", required: true },
    text: { type: String, required: true },
    image: { type: String }, // Optional base64 image
    createdAt: { type: Date, default: Date.now },
});

const Broadcast = mongoose.model("Broadcast", BroadcastSchema);
module.exports = Broadcast;
