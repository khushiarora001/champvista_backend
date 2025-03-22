const express = require("express");
const multer = require("multer");
const path = require("path");
const Result = require("../model/result");

const router = express.Router();

// ✅ Multer Storage Setup (For Multiple Files)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads")); // Ensure folder exists
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
}); const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});


router.post("/result/post", upload.any(), async (req, res) => {
    try {
        console.log("📥 Received Request Body:", req.body);
        console.log("📥 Received Files:", req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        const requestData = JSON.parse(req.body.data);
        const { classId, sectionId, type, students } = requestData;

        // ✅ Map Images with Student ID
        const imageMap = {};
        req.files.forEach(file => {
            console.log("📷 Processing File:", file);

            const match = file.fieldname.match(/photos_(.*)/);
            console.log("🎯 Extracted Student ID:", match ? match[1] : "No Match");

            if (match) {
                const studentId = match[1];
                if (!imageMap[studentId]) imageMap[studentId] = [];
                imageMap[studentId].push(`/uploads/${file.filename}`);
            }
        });

        // ✅ Process Students Data
        const studentsData = students.map(student => ({
            studentId: student.studentId || student.studentName._id,
            studentName: student.studentName,
            marks: student.marks,
            totalMarks: student.totalMarks,
            percentage: student.percentage,
            grade: student.grade,
            cgpa: student.cgpa,
            photos: imageMap[student.studentId || student.studentName._id] || []
        }));

        // ✅ Save to MongoDB
        const newResult = new Result({ classId, sectionId, type, students: studentsData });
        await newResult.save();

        res.status(201).json({ success: true, message: "Result added successfully", data: newResult });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});
// ✅ **GET API (Fetch Result)**
router.get("/result", async (req, res) => {
    try {
        const { classId, sectionId, studentId } = req.query;

        let query = {};
        if (classId) query.classId = classId;
        if (sectionId) query.sectionId = sectionId;
        if (studentId) query["students.studentId"] = studentId;

        const results = await Result.find(query);

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// ✅ **Static Route for Serving Images**
router.use("/uploads", express.static("uploads"));

module.exports = router;
