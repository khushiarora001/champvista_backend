const User = require('../model/user');
const School = require('../model/school');
const Teacher = require('../model/teacher');

// GET /dashboard/summary
exports.getDashboardSummary = async (req, res) => {
    try {
        const { schoolId } = req.query; // Fetch schoolId from query params

        const filter = schoolId ? { school: schoolId } : {}; // Filter if schoolId exists

        const totalStudents = await User.countDocuments({ role: 'student', ...filter });
        const totalTeachers = await User.countDocuments({ role: 'teacher', ...filter });

        res.status(200).json({
            totalStudents,
            totalTeachers,
            message: schoolId ? 'School-specific data fetched' : 'Global data fetched'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard summary' });
    }
};

// GET /dashboard/institutes
exports.getTotalInstitutesSummary = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 for precise comparison

        // Filters for querying
        const totalFilter = schoolId ? { _id: schoolId } : {};
        const activeFilter = schoolId
            ? { _id: schoolId, planExpiry: { $gte: today } } // Active: expires today or in the future
            : { planExpiry: { $gte: today } };
        const expiredFilter = schoolId
            ? { _id: schoolId, planExpiry: { $lt: today } } // Expired: expired before today
            : { planExpiry: { $lt: today } };

        // Query counts
        const totalCount = await School.countDocuments(totalFilter); // Total institutes
        const activeCount = await School.countDocuments(activeFilter); // Active institutes
        const expiredCount = await School.countDocuments(expiredFilter); // Expired institutes

        // Response
        res.status(200).json({
            totalInstitutes: totalCount,
            activeInstitutes: activeCount,
            expiredInstitutes: expiredCount,
            message: schoolId ? 'School-specific institutes summary fetched' : 'Global institutes summary fetched',
        });
    } catch (error) {
        console.error('Error fetching institutes summary:', error);
        res.status(500).json({
            message: 'Error fetching institutes summary',
            error: error.message,
        });
    }
};


// GET /dashboard/active
exports.getActiveInstitutes = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const filter = schoolId ? { _id: schoolId, status: 'active' } : { status: 'active' };

        const count = await School.countDocuments(filter);

        res.status(200).json({
            count,
            message: schoolId ? 'School-specific active institute count fetched' : 'Global active institute count fetched'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching active institutes count' });
    }
};

// GET /dashboard/users
exports.getTotalUsers = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const filter = schoolId ? { school: schoolId } : {};

        const count = await User.countDocuments(filter);

        res.status(200).json({
            count,
            message: schoolId ? 'School-specific user count fetched' : 'Global user count fetched'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching total users count' });
    }
};

// GET /dashboard/teachers-leave
exports.getTeachersOnLeave = async (req, res) => {
    try {
        const { schoolId } = req.query;

        const filter = schoolId ? { school: schoolId, onLeave: true } : { onLeave: true };

        const teacherList = await Teacher.find(filter);

        res.status(200).json({
            teacherList,
            message: schoolId ? 'School-specific teachers on leave fetched' : 'Global teachers on leave fetched'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching teachers on leave' });
    }
};
exports.getSchoolDashboard = async (req, res) => {
    try {
        const { schoolId } = req.query;

        if (!schoolId) {
            return res.status(400).json({ message: "School ID is required" });
        }

        // Get school details
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count total students and teachers for this school
        const totalStudents = await User.countDocuments({ role: 'student', school: schoolId });
        const totalTeachers = await User.countDocuments({ role: 'teacher', school: schoolId });

        // Check plan expiry status
        const isPlanActive = school.planExpiry >= today;

        res.status(200).json({
            schoolName: school.name,
            totalStudents,
            totalTeachers,
            planExpiryDate: school.planExpiry,
            planStatus: isPlanActive ? "Active" : "Expired",
            message: "School dashboard data fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching school dashboard data:", error);
        res.status(500).json({
            message: "Error fetching school dashboard data",
            error: error.message,
        });
    }
};