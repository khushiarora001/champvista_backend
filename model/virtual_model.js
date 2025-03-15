const mongoose = require("mongoose");

const VirtualClassSchema = new mongoose.Schema({

    classId: { type: String, required: true },
    sectionId: { type: String, required: true },

    subject: { type: String, required: true },
    zoomLink: { type: String, required: true },
    dateTime: { type: Date, required: true },
});

module.exports = mongoose.model("VirtualClass", VirtualClassSchema);
