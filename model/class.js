const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        }
    ],
    timetable: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Timetable',
        }
    ],
    attendance: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Attendance',
        }
    ],
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
