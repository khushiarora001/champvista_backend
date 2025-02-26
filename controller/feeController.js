const Fee = require('../model/fee');

// GET /fee/:studentId
const StudentFee = require('../model/fee');
const User = require('../model/user');

// Get fee details for all students
exports.getAllStudentsFeeDetails = async (req, res) => {
    try {
        const { classId, sectionId } = req.query; // 👈 Query parameters extract kar rahe hain

        let filter = {}; // Empty filter object

        if (classId) {
            filter.classId = classId; // 👈 classId ko filter me add karenge
        }

        if (sectionId) {
            filter.sectionId = sectionId; // 👈 sectionId ko filter me add karenge
        }

        const fees = await StudentFee.find(filter)
            .populate("studentId", "name");

        if (!fees.length) {
            return res.status(404).json({ message: "No student fee records found" });
        }

        res.status(200).json({
            success: true,
            students: fees.map(fee => ({
                studentId: fee.studentId,
                name: fee.name,
                classId: fee.classId,
                className: fee.className, sectionName: fee.sectionName,
                sectionId: fee.sectionId,  // 👈 Section ID bhi response me bhej rahe hain
                schoolId: fee.schoolId,
                totalFeeAmount: fee.totalFeeAmount,
                pendingFees: fee.pendingFees,
                dueDate: fee.dueDate,
                transactionHistory: fee.transactionHistory
            }))
        });
    } catch (error) {
        console.error("🔥 Error fetching student fees:", error);
        res.status(500).json({ message: "Server error while fetching fee details" });
    }
};

exports.addClassFee = async (req, res) => {
    try {
        const { classId, schoolId, feeAmount } = req.body;

        if (!classId || !schoolId || !feeAmount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if fee already exists for the class
        const existingFee = await Fee.findOne({ classId, schoolId });
        if (existingFee) {
            return res.status(400).json({ message: "Fee already set for this class" });
        }

        const newFee = new Fee({
            classId,
            schoolId,
            feeAmount
        });

        await newFee.save();

        res.status(201).json({
            success: true,
            message: "Fee added successfully",
            feeDetails: newFee
        });
    } catch (error) {
        console.error("🔥 Error adding fee:", error);
        res.status(500).json({ message: "Server error while adding fee" });
    }
};

exports.getStudentFeeDetails = async (req, res) => {
    try {
        const { studentEmail } = req.params;

        if (!studentEmail) {
            return res.status(400).json({ message: "Student Email is required" });
        }

        const fee = await StudentFee.findOne({ studentEmail }).populate("studentId", "name");

        if (!fee) {
            return res.status(404).json({ message: "No fee records found for this student" });
        }

        res.status(200).json({
            success: true,
            studentId: fee.studentId,
            name: fee.name,

            className: fee.className, sectionName: fee.sectionName,
            classId: fee.classId,
            schoolId: fee.schoolId,
            totalFeeAmount: fee.totalFeeAmount,
            pendingFees: fee.pendingFees,
            dueDate: fee.dueDate,
            transactionHistory: fee.transactionHistory
        });
    } catch (error) {
        console.error("🔥 Error fetching student fee details:", error);
        res.status(500).json({ message: "Server error while fetching student fee details" });
    }
};
// Get fee details for a specific class
exports.getClassFeeDetails = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }

        const fees = await StudentFee.find({ classId }).populate("studentId", "name");

        if (!fees.length) {
            return res.status(404).json({ message: "No fee records found for this class" });
        }

        res.status(200).json({
            success: true,
            classId: classId,
            students: fees.map(fee => ({
                studentId: fee.studentId._id,
                name: fee.studentId.name,
                totalFeeAmount: fee.totalFeeAmount,
                pendingFees: fee.pendingFees,
                dueDate: fee.dueDate,
                transactionHistory: fee.transactionHistory
            }))
        });
    } catch (error) {
        console.error("🔥 Error fetching class fee details:", error);
        res.status(500).json({ message: "Server error while fetching class fee details" });
    }
};
