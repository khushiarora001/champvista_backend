const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    eventName: { type: String },
    eventStartDate: {
        type: Date,
        required: true,
    },
    eventEndDate: {
        type: Date,
        required: true
    },
    eventType: {
        type: String
    }, schoolEmail: {
        type: String,
        required: true,
    }


}, { timestamps: true });

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
