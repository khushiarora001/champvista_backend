

// POST /teacher/add
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../model/teacher');
const School = require('../model/school');
const User = require('../model/user');

// Validate teacher data (customize as needed)
exports.getTeacherProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};// ✅ Teacher ke Allocated Classes fetch karne ka API
exports.getTeacherClasses = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });
        if (teacher.disabled) {
            return res.status(403).json({ message: 'This teacher is disabled and cannot be accessed.' });
        }
        res.status(200).json({ classesAllocated: teacher.classesAllocated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
        for (const teacher of teachers) {
            const existingTeacher = await User.findOne({
                $or: [{ email: teacher.email }, { phone: teacher.phone }],
            });

            if (existingTeacher) {
                return res.status(400).json({ message: `Teacher with email ${teacher.email} or phone ${teacher.phone} already exists.` });
            }
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

// PUT /teacher/disable/:teacherId
exports.disableTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        // Disable the teacher
        teacher.disabled = true;
        await teacher.save();

        // Optionally, you can disable the user associated with the teacher if you have a User model for authentication.
        const user = await User.findOne({ email: teacher.email });
        if (user) {
            user.disabled = true;  // Assuming there's a `disabled` field in the User schema
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Teacher disabled successfully.',
        });
    } catch (error) {
        console.error('Error disabling teacher:', error.message);
        res.status(500).json({ message: 'Failed to disable teacher', error: error.message });
    }
};


// GET /teacher/:schoolId
// GET /teacher/:email
exports.getTeacherBySchoolEmail = async (req, res) => {
    try {
        const { schoolEmail } = req.params;

        if (!schoolEmail) {
            return res.status(400).json({ message: 'School email is required.' });
        }

        // Find teachers by school email, excluding disabled ones
        const teachers = await Teacher.find({ schoolEmail, disabled: { $ne: true } })
            .populate({
                path: 'classAllocated',
                populate: [
                    {
                        path: 'sections.classTeacher', // Populate class teacher
                        select: '_id name email'
                    },
                    {
                        path: 'sections.subjectTeachers.teacherId', // Populate subject teachers
                        select: '_id name email'
                    }
                ],
                select: 'className sections'
            });

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found for this school email.' });
        }

        const filteredTeachers = teachers.map(teacher => ({
            ...teacher.toObject(),
            classAllocated: teacher.classAllocated.map(classItem => ({
                className: classItem.className,
                sections: (classItem.sections || [])
                    .map(section => {
                        let roles = [];

                        // ✅ Check if this teacher is the class teacher
                        if (section.classTeacher?._id.toString() === teacher._id.toString()) {
                            roles.push("Class Teacher");
                        }

                        // ✅ Find all subjects this teacher teaches in this section
                        let taughtSubjects = section.subjectTeachers
                            .filter(st => st.teacherId?._id.toString() === teacher._id.toString())
                            .map(st => st.subject);

                        if (taughtSubjects.length > 0) {
                            roles.push(`Teaches: ${taughtSubjects.join(", ")}`);
                        }

                        return {
                            sectionName: section.sectionName,
                            role: roles.length > 0 ? roles.join(" | ") : "None"
                        };
                    })
                    .filter(section => section.role !== "None"), // ✅ Only return sections where teacher has a role
            })),
        }));

        res.status(200).json({
            success: true,
            teachers: filteredTeachers,
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
