const mongoose = require("mongoose");

const CircularSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    types: [{ type: String, enum: ["Parent", "Teacher"], required: true }],
    schoolEmail: { type: String, required: true },
    attachments: [{ type: String }], // ✅ Buffer se String kiya
}, { timestamps: true });

module.exports = mongoose.model("Circular", CircularSchema);
