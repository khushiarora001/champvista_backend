const Teacher = require('../model/teacher');
const School = require('../model/school')
// Utility function to validate teacher data
const validateTeacher = (teacher) => {
    const missingFields = [];
    if (!teacher.name) missingFields.push('name');
    if (!teacher.phone) missingFields.push('phone');
    if (!teacher.password) missingFields.push('password');
    if (!teacher.email) missingFields.push('email');
    if (!teacher.gender) missingFields.push('gender');
    if (!teacher.subject) missingFields.push('subject');
    if (!teacher.class) missingFields.push('class');
    return missingFields;
};


// POST /teacher/add
exports.addTeacher = async (req, res) => {
    try {
        const { email, teachers } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required to add teachers.' });
        }
        if (!Array.isArray(teachers) || teachers.length === 0) {
            return res.status(400).json({ message: 'Invalid input. Expected a non-empty array of teachers.' });
        }
        const school = await School.findOne({ schoolEmail: email.trim() }); // Normalize and match
        console.log('School Found:', school); // Log the found school (null if not found)

        if (!school) {
            return res.status(404).json({ message: 'School with the provided email is not registered.' });

        }

        // Validate individual teacher objects
        const invalidTeachers = teachers.map((teacher, index) => ({
            index,
            missingFields: validateTeacher(teacher),
        })).filter((teacher) => teacher.missingFields.length > 0);

        if (invalidTeachers.length > 0) {
            return res.status(400).json({
                message: 'Some teachers have missing required fields.',
                invalidTeachers,
            });
        }

        // Add school email to each teacher and insert in batches
        const teachersDataWithSchoolEmail = teachers.map(teacher => ({ ...teacher, schoolEmail: email }));
        const BATCH_SIZE = 100;
        const totalTeachers = teachersDataWithSchoolEmail.length;
        let addedTeachers = [];

        for (let i = 0; i < totalTeachers; i += BATCH_SIZE) {
            const batch = teachersDataWithSchoolEmail.slice(i, i + BATCH_SIZE);
            const result = await Teacher.insertMany(batch, { ordered: false }); // 'ordered: false' skips duplicates
            addedTeachers = addedTeachers.concat(result);
        }

        res.status(201).json({
            success: true,
            message: `${addedTeachers.length} teachers added successfully`,
            teachersAdded: addedTeachers,
        });
    } catch (error) {
        console.error('Error adding teachers:', error.message);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate entry detected', error: error.message });
        }
        res.status(500).json({ message: 'Failed to add teachers', error: error.message });
    }
};


// GET /teacher/:schoolId
// GET /teacher/:email
exports.getTeacherBySchoolEmail = async (req, res) => {
    try {
        const { schoolEmail } = req.params;

        // Validate input
        if (!schoolEmail) {
            return res.status(400).json({ message: 'School email is required.' });
        }

        // Find teachers by school email
        const teachers = await Teacher.find({ schoolEmail });

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found for this school email.' });
        }

        res.status(200).json({
            success: true,
            teachers,
            message: 'Teachers fetched successfully.',
        });
    } catch (error) {
        console.error('Error fetching teachers:', error.message);
        res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
    }
};


// PUT /teacher/update/:teacherId
// GET /teacher/:email



// POST /teacher/apply-leave
exports.applyTeacherLeave = async (req, res) => {
    try {
        const { teacherId, dates } = req.body;

        // Validate input
        if (!teacherId || !dates || dates.length === 0) {
            return res.status(400).json({ message: 'Teacher ID and leave dates are required.' });
        }

        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        const leave = {
            teacherId,
            dates,
            status: 'Pending',
        };

        teacher.leaves.push(leave);
        await teacher.save();

        res.status(200).json({
            success: true,
            message: 'Leave applied successfully.',
        });
    } catch (error) {
        console.error('Error applying leave:', error.message);
        res.status(500).json({ message: 'Failed to apply leave', error: error.message });
    }
};

// PUT /teacher/leave-status
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status } = req.body;

        if (!leaveId || !status) {
            return res.status(400).json({ message: 'Leave ID and status are required.' });
        }

        const teacher = await Teacher.findOne({ 'leaves._id': leaveId });

        if (!teacher) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        const leave = teacher.leaves.id(leaveId);
        leave.status = status;
        await teacher.save();

        res.status(200).json({
            success: true,
            message: `Leave ${status} successfully.`,
        });
    } catch (error) {
        console.error('Error updating leave status:', error.message);
        res.status(500).json({ message: 'Failed to update leave status', error: error.message });
    }
};
