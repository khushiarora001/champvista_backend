
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
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../model/teacher');
const School = require('../model/school');
const User = require('../model/user');

// Validate teacher data (customize as needed)


// Ensure the correct path to your School model

exports.addTeacher = async (req, res) => {
    try {
        const { schoolEmail, teachers } = req.body;

        if (!schoolEmail) {
            return res.status(400).json({ message: 'School Email is required to add teachers.' });
        }
        if (!Array.isArray(teachers) || teachers.length === 0) {
            return res.status(400).json({ message: 'Invalid input. Expected a non-empty array of teachers.' });
        }

        // Find the school by email
        const school = await School.findOne({ schoolEmail: schoolEmail.trim() });
        if (!school) {
            return res.status(404).json({ message: 'School with the provided email is not registered.' });
        }

        const teachersDataWithSchoolEmail = teachers.map(teacher => ({
            ...teacher,
            schoolEmail: schoolEmail,
        }));

        // Insert teachers into Teacher collection
        const addedTeachers = await Teacher.insertMany(teachersDataWithSchoolEmail, { ordered: false });

        const teacherUsers = [];

        for (const teacher of addedTeachers) {
            // Hash password
            const hashedPassword = await bcrypt.hash(teacher.password || 'defaultPassword123', 10);

            // Create teacher user
            const teacherUser = new User({
                name: teacher.name,
                email: teacher.email,
                password: hashedPassword,
                role: 'Teacher',  // Assigning the "Teacher" role
                schoolEmail: schoolEmail,
                phone: teacher.phone,
            });
            await School.updateOne(
                { schoolEmail: schoolEmail },
                { $inc: { teacherCount: addedTeachers.length } } // ✅ Increment teacher count
            );

            await teacherUser.save();

            // Generate JWT Token
            const token = jwt.sign(
                {
                    id: teacherUser._id,
                    role: teacherUser.role,
                    email: teacherUser.email,
                    schoolEmail: teacherUser.schoolEmail,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            teacherUsers.push({ teacherUser, token });
        }

        res.status(201).json({
            success: true,
            message: `${addedTeachers.length} teachers added and signed up as "Teacher" role successfully`,
            teachersAdded: addedTeachers,
            teacherUsers,
        });
    } catch (error) {
        console.error('Error adding teachers:', error.message);
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
