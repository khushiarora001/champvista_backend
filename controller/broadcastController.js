const express = require("express");
const router = express.Router(); const Broadcast = require("../model/broadcast");




// 🟢 **API to send a broadcast message**
exports.giveBroadCast = async (req, res) => {

    try {
        const { text, classId, sectionId, teacherId } = req.body;


        if (!text || !classId) {
            return res.status(400).json({ message: "Text and Class ID are required" });
        }

        // Convert image to base64 if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
        }

        // Save broadcast message
        const broadcast = new Broadcast({ classId, sectionId, teacherId, text, image: imageUrl });
        await broadcast.save();

        res.status(201).json({ message: "Message broadcasted successfully", broadcast });

    } catch (error) {
        res.status(500).json({ message: "Error sending broadcast message", error: error.message });
    }
};

// 🟢 **API for students to get broadcast messages for their class**
exports.getBroadCastMessage = async (req, res) => {
    try {
        const { classId, teacherId, sectionId } = req.query; // Fetch parameters from query instead of params

        let filter = {}; // Initialize an empty filter object

        if (classId) filter.classId = classId; // Add classId to filter if provided
        if (teacherId) filter.teacherId = teacherId; // Add teacherId to filter if provided
        if (sectionId) filter.sectionId = sectionId;
        const messages = await Broadcast.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Broadcast messages retrieved successfully",
            messages
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching broadcast messages",
            error: error.message
        });
    }
};
exports.deleteBroadCastMessage = async (req, res) => {
    try {
        const { messageId } = req.params; // Get the message ID from URL params

        const deletedMessage = await Broadcast.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ message: "Broadcast message not found" });
        }

        res.status(200).json({ message: "Broadcast message deleted successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting broadcast message",
            error: error.message
        });
    }
};


