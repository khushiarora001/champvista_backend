const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    address: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    disabled: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String },
    rollNumber: { type: String },
    schoolEmail: { type: String },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    className: { type: String },
    sectionName: { type: String },
    bloodGroup: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    admissionNumber: { type: String, required: true, unique: true },
    isTransportService: { type: Boolean, default: false },
    transportRoute: { type: String },
    driverName: { type: String },
    busPick: { type: String },
    busDrop: { type: String },
    imageUrl: { type: String },  // Base64 image URL
    idCardUrl: { type: String }, // Base64 image URL

});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
