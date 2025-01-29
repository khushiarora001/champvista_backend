const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    // other fields...
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
