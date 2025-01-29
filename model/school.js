const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    website: { type: String, required: true },
    affiliationNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    googleMapLink: { type: String, required: true },
    schoolEmail: { type: String, required: false },
    planExpiry: { type: Date, required: true },
    password: { type: String, required: false }
});

module.exports = mongoose.model('School', schoolSchema);
