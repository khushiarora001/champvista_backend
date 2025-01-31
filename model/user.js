const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, enum: ['School', 'Admin', 'Teacher', 'Student'], default: 'Student' }
});

module.exports = mongoose.model('User', userSchema);
