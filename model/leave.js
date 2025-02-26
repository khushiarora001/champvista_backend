const mongoose = require('mongoose');

// Leave request schema
const leaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the User model
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    days: {
        type: Number,  // Optional: days of leave
    },
    schoolEmail: {
        type: String, // School email to notify about the leave
        required: true
    },
    remarks: {
        type: String, // Admin remarks (optional but useful)
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
