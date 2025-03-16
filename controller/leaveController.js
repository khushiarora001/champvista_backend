const Leave = require('../model/leave');
const User = require('../model/user')
// PUT /leave/manage/:id
const mongoose = require('mongoose');
const Attendance = require('../model/attendence');
const Student = require("../model/student"); // Import Student Model
exports.manageLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks, schoolEmail } = req.body;

        // Find the user by email
        const user = await User.findOne({ email: schoolEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Only "School" role users can approve/reject leaves
        if ((action === 'approve' || action === 'reject') && user.role !== 'School') {
            return res.status(403).json({ message: 'You do not have permission to approve or reject leaves' });
        }

        // Find the leave request
        const leave = await Leave.findById(id).populate("userId");
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        let updatedAttendance = [];

        switch (action) {
            case 'approve':
                if (leave.status !== 'pending') {
                    return res.status(400).json({ message: 'Leave already processed' });
                }
                leave.status = 'approved';

                // ✅ **Attendance Update Logic**
                if (leave.userId.role === "Student") {
                    updatedAttendance = await updateAttendance(leave.userId._id, leave.fromDate, leave.toDate, 'Leave', 'studentId');
                } else if (leave.userId.role === "Teacher") {
                    updatedAttendance = await updateAttendance(leave.userId._id, leave.fromDate, leave.toDate, 'Leave', 'teacherId');
                }
                break;

            case 'reject':
                if (leave.status !== 'pending') {
                    return res.status(400).json({ message: 'Leave already processed' });
                }
                leave.status = 'rejected';
                break;

            case 'cancel':
                leave.status = 'cancelled';
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }if (remarks) {
            leave.remarks = remarks; // Storing remarks in the leave document
        }


        await leave.save();

        res.status(200).json({
            success: true,
            message: `Leave ${action}d successfully`,
            leaveDetails: leave,
            updatedAttendance: updatedAttendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process leave', error: error.message });
    }
};

const updateAttendance = async (userId, fromDate, toDate, status, userField) => {
    try {
        const dates = generateDateRange(fromDate, toDate);
        let updatedRecords = [];

        for (const date of dates) {
            const attendance = await Attendance.findOneAndUpdate(
                { [userField]: userId, date },
                { $set: { status } },
                { upsert: true, new: true }
            );
            updatedRecords.push(attendance);
        }

        return updatedRecords;
    } catch (error) {
        console.error(`Error updating ${userField} attendance:`, error);
        return [];
    }
};

// Function to generate date range between fromDate and toDate
const generateDateRange = (fromDate, toDate) => {
    const dates = [];
    let currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]); // Format: YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};




exports.getLeaveRequestList = async (req, res) => {
    try {
        const { status, schoolEmail, fromDate, toDate, page = 1, limit = 10, userId } = req.query;

        let filter = {};

        if (status) filter.status = status;
        if (schoolEmail) filter.schoolEmail = schoolEmail;
        if (fromDate && toDate) {
            filter.fromDate = { $gte: new Date(fromDate) };
            filter.toDate = { $lte: new Date(toDate) };
        }
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            filter.userId = userId;
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch leave requests and populate user details
        const leaves = await Leave.find(filter)
            .populate({
                path: "userId",
                select: "name email role phone",
            })
            .skip(skip)
            .limit(limitNumber)
            .sort({ fromDate: -1 })
            .lean(); // Convert to JSON

        // Fetch class and section if user is a student
        for (let leave of leaves) {
            if (leave.userId && leave.userId.role === "Student") {
                const student = await Student.findOne({ email: leave.userId.email })
                    .select("classId sectionId")
                    .lean();

                if (student) {
                    leave.classId = student.classId;
                    leave.sectionId = student.sectionId;
                }
            }
        }

        const totalLeaves = await Leave.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalLeaves,
            page: pageNumber,
            limit: limitNumber,
            leaves,
        });
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve leave requests", error: error.message });
    }
};


// POST /leave/request
exports.createLeaveRequest = async (req, res) => {
    try {
        const { userId, fromDate, toDate, reason, schoolEmail } = req.body;

        // Validate the input data
        if (!userId || !fromDate || !toDate || !reason || !schoolEmail) {
            return res.status(400).json({ message: 'User ID, From Date, To Date, Reason, and School Email are required.' });
        }
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        // Convert to local time (optional, but not recommended)
        const localFromDate = new Date(fromDateObj.getTime() - fromDateObj.getTimezoneOffset() * 60000);
        const localToDate = new Date(toDateObj.getTime() - toDateObj.getTimezoneOffset() * 60000);
        // Calculate the number of leave days (optional if you want it to be auto-calculated)
        const diffTime = Math.abs(new Date(toDate) - new Date(fromDate));
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Convert to days

        const leaveRequest = new Leave({
            userId,
            fromDate: localFromDate,
            toDate: localToDate,
            reason,
            schoolEmail,
            days
        });



        // Save the leave request to the database
        await leaveRequest.save();

        // Return the created leave request in the response
        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            leaveDetails: leaveRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit leave request', error: error.message });
    }
};


// Example role checking function (You should implement this based on your auth/role logic)
async function checkRole(userId, requiredRole) {
    // Your logic to check if the user has the required role (e.g., from a database or a JWT token)
    const user = await User.findById(userId);
    if (user && user.role === requiredRole) {
        return true;
    }
    return false;
}
