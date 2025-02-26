const Student = require('../model/student');
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');
const mongoose = require('mongoose'); // Ensure this line is at the to
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const Fee = require('../model/fee');
// Multer storage configuration for file uploads

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `school_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB file size limit
});

// Add Student API (Only School or Teacher can add students)
exports.addStudent = async (req, res) => {
    try {
        console.log("📝 Received Body:", req.body);
        console.log("📂 Received Files:", req.files);

        const {
            name,
            dob,
            address,
            city,
            state,
            fatherName,
            motherName,
            phoneNumber,
            email,
            password,
            schoolEmail,
            classId,
            sectionId,
            bloodGroup,
            gender,
            admissionNumber,
            isTransportService,
            transportRoute,
            driverName,
            busPick,
            busDrop,
            className,
            sectionName,
            imageUrl,
            idCardUrl
        } = req.body;
        console.log("Received image data:", imageUrl);
        // Get schoolId, teacherId, and optionally schoolEmail from the authenticated user.

        const teacherId = req.user.teacherId;
        let savedPhotoImageUrl = imageUrl;
        let savedIDImageUrl = idCardUrl;
        console.log("Received image data:", imageUrl);
        console.log(idCardUrl)
        if (!name || !dob || !classId) {
            return res.status(400).json({ message: 'Name, Date of Birth, and Class ID are required' });
        }

        if (imageUrl) {
            const imagePath = path.join(__dirname, '../uploads', `studnet_${Date.now()}.jpg`);
            console.log("Saving image to path:", imagePath);
            saveBase64Image(imageUrl, imagePath); // Save base64 image to disk
            savedPhotoImageUrl = `/uploads/${path.basename(imagePath)}`;
        }

        if (idCardUrl) {
            const imagePath = path.join(__dirname, '../uploads', `student_id_${Date.now()}.jpg`);
            console.log("Saving image to path:", imagePath);
            saveBase64Image(idCardUrl, imagePath); // Save base64 image to disk
            savedIDImageUrl = `/uploads/${path.basename(imagePath)}`;
        }

        // Auto-generate rollNumber: Find the last student in this class and section.
        let rollNumber = "1";
        const lastStudent = await Student.findOne({ classId, sectionId }).sort({ rollNumber: -1 });
        if (lastStudent && lastStudent.rollNumber) {
            rollNumber = (parseInt(lastStudent.rollNumber) + 1).toString();
        }

        // Create a new student document.
        const student = new Student({
            name,
            dob,
            city, password,
            state,
            fatherName,
            motherName,
            phoneNumber,
            email,
            classId,
            address,
            sectionId,
            bloodGroup,
            gender,
            admissionNumber,
            isTransportService,
            transportRoute,
            driverName,
            busPick,
            busDrop,
            teacherId,
            schoolEmail,
            className, sectionName,
            imageUrl: savedPhotoImageUrl,
            idCardUrl: savedIDImageUrl,
            rollNumber
        });

        await student.save();
        const hashedPassword = await bcrypt.hash(student.password || 'defaultPassword123', 10);
        // Now create a corresponding User record for the student.
        // You may want to generate a default password or use the rollNumber/dob as password (hashed) or follow your auth flow.
        const user = new User({
            name: student.name,
            email: student.email,
            phone: student.phoneNumber,
            role: 'Student',
            password: hashedPassword,
            studentId: student._id, // Link the user record with the student, if desired.
            schoolEmail: schoolEmail,
            // Optionally, add a password field here (ensure you hash it before saving)
        });
        const totalFee = 6500;
        const dueDate = new Date("2025-03-31"); // **Static due date**

        await user.save();
        const fee = new Fee({
            name: student.name,
            className: student.className,
            sectionName: student.sectionName,
            studentId: student._id,
            classId: classId,
            sectionId: sectionId,
            studentEmail: student.email,
            schoolEmail: schoolEmail, // **Get school ID from logged-in user**
            totalFeeAmount: totalFee,
            pendingFees: totalFee, // **Initially, full amount is pending**
            dueDate: dueDate,
            transactionHistory: [] // **Initially, no transactions**
        });

        await fee.save(); // **Save fee details in DB**

        res.status(201).json({
            message: 'Student and user created successfully',
            student,
            user
        });
    } catch (error) {
        console.error("🔥 Error Adding Student:", error);
        res.status(500).json({ message: 'Error adding student', error: error.message });
    }
};
function saveBase64Image(base64Data, filePath) {
    const base64Image = base64Data.split(';base64,').pop();
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, buffer);
}
exports.getStudentsBySchoolEmail = async (req, res) => {
    try {
        const { schoolEmail } = req.params;

        if (!schoolEmail) {
            return res.status(400).json({ message: 'School email is required' });
        }

        // Fetch students belonging to the given schoolEmail
        const students = await Student.find({ schoolEmail });

        res.status(200).json({
            message: 'Students fetched successfully',
            students
        });
    } catch (error) {
        console.error("🔥 Error fetching students by school email:", error);
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};


exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, address, city, state, fatherName, motherName, phoneNumber, email, classId, sectionId, bloodGroup, gender, admissionNumber, isTransportService, transportRoute, driverName, busPick, busDrop } = req.body;

        let updatedFields = {
            name, dob, address, city, state, fatherName, motherName, phoneNumber, email,
            classId, sectionId, bloodGroup, gender, admissionNumber, isTransportService,
            transportRoute, driverName, busPick, busDrop
        };

        // File Upload Handling
        if (req.files?.photo) {
            updatedFields.photo = `data:image/jpeg;base64,${req.files.photo[0].buffer.toString('base64')}`;
        }
        if (req.files?.idCard) {
            updatedFields.idCard = `data:image/jpeg;base64,${req.files.idCard[0].buffer.toString('base64')}`;
        }

        const student = await Student.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Error updating student', error: error.message });
    }
};


exports.markAttendance = async (req, res) => {
    try {
        const { date, classId, sectionId, attendanceRecords } = req.body;
        const teacherId = req.user.teacherId;

        if (!date || !classId || !sectionId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({ message: 'Invalid request. Please provide date, classId, sectionId, and attendanceRecords.' });
        }

        const attendance = new Attendance({
            date,
            classId,
            sectionId,
            markedBy: teacherId,
            attendanceRecords
        });

        await attendance.save();
        res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
};



exports.getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        const students = await Student.find({ classId });

        res.status(200).json({
            message: 'Students fetched successfully',
            students
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

exports.getStudentsByClassAndSection = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;

        if (!classId || !sectionId) {
            return res.status(400).json({ message: 'Both Class ID and Section ID are required' });
        }

        // Find students matching both classId and sectionId
        const students = await Student.find({ classId, sectionId });

        res.status(200).json({
            message: 'Students fetched successfully',
            students
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
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
