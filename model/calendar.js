const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    eventDetails: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
