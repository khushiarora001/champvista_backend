const Leave = require('../model/leave');

// GET /leave/pending
exports.getPendingLeaves = async (req, res) => {
    try {
        const pendingLeaves = await Leave.find({ status: 'pending' });

        res.status(200).json({
            success: true,
            leaveList: pendingLeaves,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch pending leaves' });
    }
};

// GET /leave/processed
exports.getProcessedLeaves = async (req, res) => {
    try {
        const processedLeaves = await Leave.find({ status: { $in: ['approved', 'rejected'] } });

        res.status(200).json({
            success: true,
            leaveList: processedLeaves,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch processed leaves' });
    }
};

// PUT /leave/approve/:id
exports.approveLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = 'approved';
        await leave.save();

        res.status(200).json({
            success: true,
            message: 'Leave application approved successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to approve leave' });
    }
};

// PUT /leave/reject/:id
exports.rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = 'rejected';
        await leave.save();

        res.status(200).json({
            success: true,
            message: 'Leave application rejected successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reject leave' });
    }
};
