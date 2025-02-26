const Calendar = require('../model/calendar');
const School = require("../model/school");

// ✅ POST: Add Event to School Calendar
exports.addEvent = async (req, res) => {
    try {
        const { schoolEmail, eventName, eventType, eventDate, description } = req.body;

        if (!schoolEmail || !eventName || !eventType || !eventDate) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Check if school exists
        const schoolExists = await School.findOne({ schoolEmail });
        if (!schoolExists) {
            return res.status(404).json({ message: "School not found." });
        }

        const newEvent = new Calendar({ schoolEmail, eventName, eventType, eventDate, description });
        await newEvent.save();

        res.status(201).json({ success: true, message: "Event added successfully", event: newEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to add event", error: error.message });
    }
};

// ✅ GET: Fetch Events by School Email
exports.getEventsBySchool = async (req, res) => {
    try {
        const { schoolEmail } = req.params;

        const events = await Calendar.find({ schoolEmail }).sort({ eventDate: 1 });

        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
};

// ✅ GET: Fetch Events within a Date Range
exports.getEventsByDate = async (req, res) => {
    try {
        const { schoolEmail, startDate, endDate } = req.query;

        const events = await Calendar.find({
            schoolEmail,
            eventDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).sort({ eventDate: 1 });

        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
};

// ✅ PUT: Update Event
exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updates = req.body;

        const updatedEvent = await Calendar.findByIdAndUpdate(eventId, updates, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ success: true, message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Failed to update event", error: error.message });
    }
};

// ✅ DELETE: Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const deletedEvent = await Calendar.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete event", error: error.message });
    }
};
