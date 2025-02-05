const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Student or Teacher ID
    date: { type: Date, required: true },  // Date of attendance
    status: { type: String, enum: ['present', 'absent'], default: 'absent' },  // Present or Absent
    leaveStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' }, // Leave status
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
