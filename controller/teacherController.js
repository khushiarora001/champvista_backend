const Teacher = require('../model/teacher');

// POST /teacher/add
exports.addTeacher = async (req, res) => {
    try {
        const { name, contact, subject } = req.body;

        const teacher = new Teacher({ name, contact, subject });
        await teacher.save();

        res.status(201).json({
            success: true,
            teacherId: teacher._id,
            message: 'Teacher added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add teacher' });
    }
};

// PUT /teacher/update/:id
exports.updateTeacherDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const teacher = await Teacher.findByIdAndUpdate(id, updates, { new: true });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher details updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update teacher details' });
    }
};

// GET /teacher/:id
exports.getTeacherDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({
            teacherDetails: teacher,
            message: 'Teacher details fetched successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch teacher details' });
    }
};

// POST /teacher/apply-leave
exports.applyTeacherLeave = async (req, res) => {
    try {
        const { teacherId, dates } = req.body;

        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const leave = {
            teacherId,
            dates,
            status: 'Pending',
        };

        // Here we assume leave is saved in the teacher record itself
        teacher.leaves.push(leave);
        await teacher.save();

        res.status(200).json({
            success: true,
            message: 'Leave applied successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to apply leave' });
    }
};

// PUT /teacher/leave-status
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status } = req.body;

        const teacher = await Teacher.findOne({ 'leaves._id': leaveId });

        if (!teacher) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const leave = teacher.leaves.id(leaveId);
        leave.status = status;
        await teacher.save();

        res.status(200).json({
            success: true,
            message: `Leave ${status} successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update leave status' });
    }
};
