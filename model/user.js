const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['School', 'Admin', 'Teacher', 'Student'], default: 'Student' },
    phone: { type: String },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // Add this field
});

module.exports = mongoose.model('User', userSchema);
