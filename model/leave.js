const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    leaveStartDate: {
        type: Date,
        required: true,
    },
    leaveEndDate: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
