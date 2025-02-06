const Leave = require('../model/leave');
const User = require('../model/user')
// PUT /leave/manage/:id
exports.manageLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, action, schoolEmail } = req.body;

        // Find user by email, assuming checkRole expects a userId (ObjectId), but we will use the email for validation
        // To see the role and other data

        const user = await User.findOne({ email: schoolEmail });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Check if user has the correct role for approve/reject actions
        const hasPermission = user.role === 'School'; // You can change this based on your role logic
        if (action === 'approve' || action === 'reject') {
            if (!hasPermission) {
                return res.status(403).json({ message: 'You do not have permission to approve or reject leaves' });
            }
        }

        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        // Handle different actions based on the role and requested action
        switch (action) {
            case 'approve':
                if (leave.status !== 'pending') {
                    return res.status(400).json({ message: 'Leave cannot be approved. It may already be processed.' });
                }
                leave.status = 'approved';
                break;

            case 'reject':
                if (leave.status !== 'pending') {
                    return res.status(400).json({ message: 'Leave cannot be rejected. It may already be processed.' });
                }
                leave.status = 'rejected';
                break;

            case 'cancel':
                // Cancel can be done at any stage (pending, approved, rejected)
                leave.status = 'cancelled';
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        // Check if the fromDate and toDate are valid
        if (!leave.fromDate || !leave.toDate) {
            return res.status(400).json({ message: 'From date and to date are required.' });
        }

        // Optionally, calculate the number of days off (if not already calculated)
        if (!leave.days) {
            const diffTime = Math.abs(new Date(leave.toDate) - new Date(leave.fromDate));
            leave.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Convert to days
        }

        await leave.save();

        res.status(200).json({
            success: true,
            message: `Leave application ${action}d successfully`,
            leaveDetails: leave, // Return updated leave details, including dates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process leave', error: error.message });
    }
};

// GET /leave/requests
exports.getLeaveRequestList = async (req, res) => {
    try {
        const { status, schoolEmail, fromDate, toDate, page = 1, limit = 10, userId } = req.query;

        // Build the query object based on optional filters
        let filter = {};

        if (status) {
            filter.status = status; // Filter by leave status (e.g., 'approved', 'pending', 'rejected', etc.)
        }

        if (schoolEmail) {
            filter.schoolEmail = schoolEmail; // Filter by schoolEmail
        }

        if (fromDate && toDate) {
            filter.fromDate = { $gte: new Date(fromDate) }; // Filter by fromDate
            filter.toDate = { $lte: new Date(toDate) }; // Filter by toDate
        }

        if (userId) {
            filter.userId = userId; // Filter by userId to get only the leave requests of a specific user
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Find leaves based on filter and pagination, and populate the user data
        const leaves = await Leave.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ fromDate: -1 }) // Sort by fromDate descending (newest first)
            .populate('userId', 'name email role phone'); // Populate the user data (you can adjust which fields you want from the user model)

        const totalLeaves = await Leave.countDocuments(filter); // Get the total count for pagination

        // Return the list of leave requests along with pagination info
        res.status(200).json({
            success: true,
            totalLeaves,
            page,
            limit,
            leaves
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve leave requests', error: error.message });
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

        // Calculate the number of leave days (optional if you want it to be auto-calculated)
        const diffTime = Math.abs(new Date(toDate) - new Date(fromDate));
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Convert to days

        // Create a new leave request
        const leaveRequest = new Leave({
            userId,
            fromDate,
            toDate,
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
