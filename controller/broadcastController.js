const express = require("express");
const router = express.Router(); const Broadcast = require("../model/broadcast");




// 🟢 **API to send a broadcast message**
exports.giveBroadCast = async (req, res) => {

    try {
        const { text, classId, teacherId } = req.body;


        if (!text || !classId) {
            return res.status(400).json({ message: "Text and Class ID are required" });
        }

        // Convert image to base64 if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
        }

        // Save broadcast message
        const broadcast = new Broadcast({ classId, teacherId, text, image: imageUrl });
        await broadcast.save();

        res.status(201).json({ message: "Message broadcasted successfully", broadcast });

    } catch (error) {
        res.status(500).json({ message: "Error sending broadcast message", error: error.message });
    }
};

// 🟢 **API for students to get broadcast messages for their class**
exports.getBroadCastMessage = async (req, res) => {

    try {
        const { classId } = req.params;

        const messages = await Broadcast.find({ classId }).sort({ createdAt: -1 });

        res.status(200).json({ message: "Broadcast messages retrieved successfully", messages });

    } catch (error) {
        res.status(500).json({ message: "Error fetching broadcast messages", error: error.message });
    }
};


