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




        classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },  // 👈 Class Teacher field added


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
        }],

    }],
    allocatedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
    schoolEmail: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Class', classSchema);
