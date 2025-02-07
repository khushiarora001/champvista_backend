const User = require('../model/user');
const School = require('../model/school');
const Teacher = require('../model/teacher');
const Students = require('../model/student');



exports.getDashboardData = async (req, res) => {
    try {
        const { schoolId } = req.query;

        if (!schoolId) {
            // Admin Dashboard Data
            const totalStudents = await Students.countDocuments();
            const totalSchools = await School.countDocuments();
            const totalTeachers = await School.countDocuments();
            const activeTeachersj = await School.countDocuments();
            const activeSchools = await School.countDocuments({ planExpiry: { $gte: new Date() } });
            const expiredSchools = await School.countDocuments({ planExpiry: { $lt: new Date() } });
            const totalUsers = await User.countDocuments();

            return res.status(200).json({
                totalStudents,
                totalTeachers,
                totalSchools,
                activeSchools,
                expiredSchools,
                totalUsers,
                message: 'Admin global dashboard data fetched successfully',
            });
        }

        // Find School using schoolId
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        const schoolEmail = school.schoolEmail; // ✅ Fetch schoolEmail
        ;
        const teachers = await Teacher.find({ schoolEmail: schoolEmail });


        // ✅ Ensure correct field names match User & Teacher collection
        const totalStudents = await Students.countDocuments({ schoolEmail: schoolEmail });
        const totalTeachers = await Teacher.countDocuments({ schoolEmail: schoolEmail });

        const activeTeachers = await Teacher.countDocuments({ schoolEmail: schoolEmail, onLeave: false });

        return res.status(200).json({
            schoolName: school.name,
            totalStudents,
            totalTeachers,
            activeTeachers,
            planExpiryDate: school.planExpiry,
            message: 'School-specific dashboard data fetched successfully',
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};
