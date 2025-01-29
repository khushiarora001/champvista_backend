const Class = require('./class');
const Teacher = require('./teacher');
const Subject = require('./subject');

// POST /class/add
exports.addClass = async (req, res) => {
    try {
        const { className, teacherId } = req.body;

        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // Create a new class
        const newClass = new Class({ className, teacherId });
        await newClass.save();

        res.status(201).json({
            success: true,
            classId: newClass._id,
            message: 'Class added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add class' });
    }
};

// PUT /class/update/:id
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedClass = await Class.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Class updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update class' });
    }
};

// DELETE /class/delete/:id
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedClass = await Class.findByIdAndDelete(id);

        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Class deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete class' });
    }
};

// GET /class/timetable/:id
exports.viewTimetable = async (req, res) => {
    try {
        const { id } = req.params;

        const classDetails = await Class.findById(id).populate('timetable');

        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({
            success: true,
            timetableDetails: classDetails.timetable,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch class timetable' });
    }
};

// GET /class/attendance/:id
exports.viewAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const classDetails = await Class.findById(id).populate('attendance');

        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.status(200).json({
            success: true,
            attendanceDetails: classDetails.attendance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch class attendance' });
    }
};

// POST /class/assign-subject
exports.assignSubjects = async (req, res) => {
    try {
        const { classId, subjects } = req.body;

        // Check if class exists
        const classDetails = await Class.findById(classId);
        if (!classDetails) return res.status(404).json({ message: 'Class not found' });

        // Assign subjects to class
        classDetails.subjects = subjects;
        await classDetails.save();

        res.status(200).json({
            success: true,
            message: 'Subjects assigned successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to assign subjects' });
    }
};
