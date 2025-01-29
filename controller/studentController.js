const Student = require('../model/student');
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');
const mongoose = require('mongoose'); // Ensure this line is at the top


// POST /student/add
exports.addStudent = async (req, res) => {
    try {
        const { name, age, classId, rollNumber } = req.body;

        // Log incoming request data for debugging
        console.log('Request Body:', req.body);

        // Validate required fields
        if (!name || !age || !classId || !rollNumber) {
            return res.status(400).json({ message: 'All fields are required: name, age, classId, rollNumber' });
        }

        // Validate if classId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: 'Invalid class ID format' });
        }

        const newStudent = new Student({ name, age, classId, rollNumber });
        await newStudent.save();

        res.status(201).json({
            success: true,
            studentId: newStudent._id,
            message: 'Student added successfully',
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
};

// PUT /student/update/:id
exports.updateStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const student = await Student.findByIdAndUpdate(id, updates, { new: true });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Student details updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update student details' });
    }
};

// GET /student/:id
exports.getStudentDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            studentDetails: student,
            message: 'Student details fetched successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch student details' });
    }
};

// PUT /student/fees
exports.manageStudentFees = async (req, res) => {
    try {
        const { studentId, amount } = req.body;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update or delete fees based on provided amount (could be 0 for delete)
        if (amount === 0) {
            student.fees = [];
        } else {
            student.fees.push({ amount });
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: 'Student fees updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to manage student fees' });
    }
};

// GET /student/pdf/:id
exports.downloadStudentPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const doc = new pdfDocument();
        const filePath = path.join(__dirname, `../uploads/${student.admissionNo}_details.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text(`Student Name: ${student.name}`);
        doc.text(`Admission No: ${student.admissionNo}`);
        doc.text(`Fees: ${student.fees.map(fee => fee.amount).join(', ')}`);
        doc.end();

        doc.on('finish', () => {
            res.status(200).json({
                success: true,
                pdfFileUrl: `/uploads/${student.admissionNo}_details.pdf`,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate PDF' });
    }
};

// GET /calendar/school
exports.getSchoolCalendar = async (req, res) => {
    try {
        // Fetch calendar details (mock data for example)
        const calendarDetails = {
            academicYear: "2025-2026",
            holidays: ["2025-12-25", "2025-01-01"],
            importantDates: ["2025-06-15", "2025-09-01"],
        };

        res.status(200).json({
            calendarDetails,
            message: 'School calendar fetched successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch school calendar' });
    }
};
