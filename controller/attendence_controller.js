// POST /attendance/mark
exports.markAttendance = async (req, res) => {
    try {
        const { userId, date, status } = req.body;

        // Check if the user has applied for leave
        const leave = await Leave.findOne({ employeeId: userId, status: 'approved', fromDate: { $lte: date }, toDate: { $gte: date } });
        if (leave) {
            return res.status(403).json({ message: 'You cannot mark attendance while on approved leave.' });
        }

        // Check if attendance already marked for this date
        const existingAttendance = await Attendance.findOne({ userId, date });
        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this date.' });
        }

        // Create new attendance record
        const newAttendance = new Attendance({
            userId,
            date,
            status,  // present/absent
        });

        await newAttendance.save();

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            attendance: newAttendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
    }
};

// PUT /attendance/update/:id
exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // present or absent

        const attendance = await Attendance.findById(id);
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

        // Check if 24 hours have passed since attendance marking
        const currentTime = new Date();
        const attendanceTime = new Date(attendance.createdAt);
        const diffTime = Math.abs(currentTime - attendanceTime);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        if (diffHours < 24) {
            return res.status(403).json({ message: 'You can only update attendance after 24 hours.' });
        }

        // Update attendance status
        attendance.status = status;
        await attendance.save();

        res.status(200).json({
            success: true,
            message: `Attendance updated to ${status}`,
            attendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update attendance', error: error.message });
    }
};

// PUT /attendance/cancel/:id
exports.cancelAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const attendance = await Attendance.findById(id);
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

        // Allow canceling attendance only if the user has leave canceled or the leave is not active anymore
        if (attendance.leaveStatus !== 'cancelled' && attendance.status !== 'absent') {
            return res.status(403).json({ message: 'Attendance cannot be canceled at this stage.' });
        }

        // Remove the attendance record
        await attendance.remove();

        res.status(200).json({
            success: true,
            message: 'Attendance canceled successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to cancel attendance', error: error.message });
    }
};
