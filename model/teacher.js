const mongoose = require('mongoose');






const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    classAllocated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    disabled: { type: Boolean, default: false },
    // New Profile Fields
    dob: { type: Date }, // Date of Birth
    address: { type: String }, // Full Address
    city: { type: String }, // City
    state: { type: String }, // State
    photo: { type: String }, // URL of the profile picture

    schoolEmail: { type: String, ref: 'School', required: true }, // Link to the School by email
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Teacher", teacherSchema);





