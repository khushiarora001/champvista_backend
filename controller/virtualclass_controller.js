const express = require("express");
const VirtualClass = require("../model/virtual_model");
const router = express.Router();

// **1. Create Virtual Class**
router.post("/create", async (req, res) => {
    try {
        const { schoolId, classId, sectionId, subject, zoomLink, dateTime } =
            req.body;

        const newClass = new VirtualClass({

            classId,
            sectionId,

            subject,
            zoomLink,
            dateTime,
        });

        await newClass.save();
        res.status(201).json({ message: "Virtual Class scheduled successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **2. Get Upcoming Classes**
router.get("/upcoming/:classId/:sectionId", async (req, res) => {
    try {
        const { classId, sectionId } = req.params;
        const today = new Date();

        const classes = await VirtualClass.find({
            sectionId,
            classId,

        }).sort({ dateTime: 1 });
        res.status(201).json({
            message: 'virtual class created successfully',
            classes: classes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **3. Delete a Virtual Class**
router.delete("/delete/:id", async (req, res) => {
    try {
        await VirtualClass.findByIdAndDelete(req.params.id);
        res.json({ message: "Virtual Class deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
