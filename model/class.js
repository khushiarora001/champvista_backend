const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,
    },
    subjects: [{
        type: String,
        ref: 'Subject'
    }],
    sections: [{
        sectionName: {
            type: String,
            required: true,
        },
        subjectTeachers: [{
            subject: {
                type: String,
                required: true,
            },
            teacherId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teacher',
                required: true,
            }
        }]
    }],
    schoolEmail: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Class', classSchema);
