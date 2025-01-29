const Calendar = require('../model/calendar');

// POST /calendar/add
exports.addCalendarEntry = async (req, res) => {
    try {
        const { eventDetails } = req.body;

        // Create a new calendar entry
        const event = new Calendar({ eventDetails });
        await event.save();

        res.status(201).json({
            success: true,
            eventId: event._id,
            message: 'Calendar event added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add calendar event' });
    }
};

// PUT /calendar/update/:id
exports.updateCalendarEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const event = await Calendar.findByIdAndUpdate(id, updates, { new: true });

        if (!event) {
            return res.status(404).json({ message: 'Calendar event not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Calendar event updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update calendar event' });
    }
};
