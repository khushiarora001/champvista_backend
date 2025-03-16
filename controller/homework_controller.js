const express = require("express");
const mongoose = require("mongoose");
const Homeworks = require("../model/homework");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

// 📌 Ensure 'uploads/' directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📌 Multer Setup (File Uploading)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// 📌 ADD HOMEWORK (POST)
router.post("/api/homework/add", upload.single("file"), async (req, res) => {
    try {
        const { classId, sectionId, teacherId, teacherName, homeworkName, description, dueDate } = req.body;

        // 🔴 Input Validation
        if (!classId || !sectionId || !homeworkName || !description || !dueDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // 📌 Convert dueDate to Proper Date Format
        const formattedDueDate = new Date(dueDate);
        if (isNaN(formattedDueDate.getTime())) {
            return res.status(400).json({ message: "Invalid dueDate format. Use YYYY-MM-DD." });
        }

        // 📌 File Handling
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 📌 Save Homework in MongoDB
        const newHomework = new Homeworks({
            classId,
            sectionId,
            teacherId,
            teacherName,
            homeworkName,
            description,
            dueDate: formattedDueDate,
            fileUrl
        });

        console.log("Saving to database:", newHomework);
        await newHomework.save();

        res.status(201).json({ message: "Homework added successfully", homework: newHomework });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 FETCH HOMEWORK (GET)
router.get("/api/homework/get", async (req, res) => {
    try {
        const { classId, sectionId } = req.query;

        let filter = {};
        if (classId) filter.classId = classId;
        if (sectionId) filter.sectionId = sectionId;

        console.log("Fetching homeworks with filter:", filter);
        const homeworks = await Homeworks.find(filter);

        res.status(200).json({ message: "Homework fetched successfully", homeworks });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
