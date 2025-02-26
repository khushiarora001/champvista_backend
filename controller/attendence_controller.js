const express = require("express");
const Attendance = require("../model/attendence");
const Leave = require("../model/leave");
const TeacherAttendance = require("../model/teacherAttendence");
const router = express.Router();

// ✅ 1. Mark Attendance (Bulk for Class)
router.post("/mark", async (req, res) => {
    try {
        const { classId, sectionId, date, attendance } = req.body;

        for (let i = 0; i < attendance.length; i++) {
            const leave = await Leave.findOne({
                studentId: attendance[i].studentId,
                fromDate: { $lte: date },
                toDate: { $gte: date },
                status: "Approved"
            });

            if (leave) {
                attendance[i].status = "Leave";
            }
        }

        const records = attendance.map(a => ({
            studentId: a.studentId,
            classId,
            sectionId,
            date,
            status: a.status
        }));

        await Attendance.insertMany(records);
        res.json({ success: true, message: "Attendance marked successfully", records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 2. Update Attendance (Bulk)
router.put("/update", async (req, res) => {
    try {
        const { classId, sectionId, date, attendance } = req.body;

        for (let i = 0; i < attendance.length; i++) {
            await Attendance.updateOne(
                { studentId: attendance[i].studentId, classId, sectionId, date },
                { $set: { status: attendance[i].status } },
                { upsert: true }
            );
        }

        res.json({ success: true, message: "Attendance updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 3. Get Student Attendance
router.get("/student/:id", async (req, res) => {
    try {
        const attendance = await Attendance.find({ studentId: req.params.id });
        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 4. Get Class Attendance Report
router.get("/class/:classId/:sectionId/:date", async (req, res) => {
    try {
        const { classId, sectionId, date } = req.params;

        const presentCount = await Attendance.countDocuments({ classId, sectionId, date, status: "Present" });
        const absentCount = await Attendance.countDocuments({ classId, sectionId, date, status: "Absent" });
        const leaveCount = await Attendance.countDocuments({ classId, sectionId, date, status: "Leave" });

        res.json({
            success: true,
            report: { present: presentCount, absent: absentCount, leave: leaveCount }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 5. Get School Attendance Report
const schoolReport = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { month, year } = req.query;

        const startDate = `${year}-${month}-01`;
        const endDate = `${year}-${month}-31`;

        const totalClasses = await Attendance.countDocuments({ date: { $gte: startDate, $lte: endDate } });
        const totalStudents = await Attendance.distinct("studentId").countDocuments();
        const totalPresent = await Attendance.countDocuments({ status: "Present", date: { $gte: startDate, $lte: endDate } });

        const attendancePercentage = ((totalPresent / (totalStudents * totalClasses)) * 100).toFixed(2);

        res.json({
            success: true,
            report: {
                totalClasses,
                totalStudents,
                averageAttendance: `${attendancePercentage}%`
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//teacher
router.put("/update", async (req, res) => {
    try {
        const { schoolId, date, attendance } = req.body;

        for (let i = 0; i < attendance.length; i++) {
            await TeacherAttendance.updateOne(
                { teacherId: attendance[i].teacherId, schoolId, date },
                { $set: { status: attendance[i].status } },
                { upsert: true }
            );
        }

        res.json({ success: true, message: "Teacher attendance updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post("/mark", async (req, res) => {
    try {
        const { schoolId, date, attendance } = req.body;

        // Loop through all teachers to check leave status
        for (let i = 0; i < attendance.length; i++) {
            const leave = await Leave.findOne({
                teacherId: attendance[i].teacherId,
                fromDate: { $lte: date },
                toDate: { $gte: date },
                status: "Approved"
            });

            if (leave) {
                attendance[i].status = "Leave"; // If leave is approved, mark as Leave
            }
        }

        // Save attendance records
        const records = attendance.map(a => ({
            teacherId: a.teacherId,
            schoolId,
            date,
            status: a.status
        }));

        await TeacherAttendance.insertMany(records);
        res.json({ success: true, message: "Teacher attendance marked successfully", records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

exports.getAttendanceByClassSectionDate = async (req, res) => {
    try {
        const { classId, sectionId, date } = req.params;

        if (!classId || !sectionId || !date) {
            return res.status(400).json({ success: false, message: 'classId, sectionId, and date are required' });
        }

        // Find attendance records matching classId, sectionId, and date.
        const attendanceRecords = await Attendance.find({ classId, sectionId, date })
            .populate('studentId', 'name email'); // Populate student details (only name & email)

        res.status(200).json({
            success: true,
            attendance: attendanceRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};



router.get("/school/:schoolId", schoolReport);

module.exports = { attendanceRoutes: router, schoolReport };
