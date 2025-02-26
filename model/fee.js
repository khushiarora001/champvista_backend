const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amountPaid: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    }
});

const studentFeeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencing the User model
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', // Referencing the Class model
        required: true
    },
    name: { type: String },
    schoolEmail: {
        type: String,
        ref: 'School', // Referencing the School model
        required: true
    },
    className: { type: String },
    sectionName: { type: String },
    studentEmail: {
        type: String,
        ref: 'School', // Referencing the School model
        required: true
    },
    totalFeeAmount: {
        type: Number,
        required: true
    },
    pendingFees: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    transactionHistory: [transactionSchema] // Array to store multiple transactions
});

module.exports = mongoose.model('StudentFee', studentFeeSchema);
