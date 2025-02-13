const Class = require('../model/class');
const Teacher = require('../model/teacher');
const Subject = require('../model/subject');
const School = require("../model/school");
const mongoose = require('mongoose');

// POST /class/add
exports.addClass = async (req, res) => {
    try {
        const { className, subjects, sections, schoolEmail } = req.body;

        // Validate input fields
        if (!className || !Array.isArray(subjects) || !Array.isArray(sections) || !schoolEmail) {
            return res.status(400).json({ message: 'Missing required fields: className, subjects, sections, or schoolEmail.' });
        }

        // Validate subjects (ensure it's an array of strings)
        if (!subjects.every(subject => typeof subject === 'string')) {
            return res.status(400).json({ message: 'Subjects should be an array of strings.' });
        }

        // Validate sections and subjectTeachers
        if (
            !sections.every(section =>
                typeof section.sectionName === 'string' &&
                Array.isArray(section.subjectTeachers) &&
                section.subjectTeachers.every(subjectTeacher =>
                    typeof subjectTeacher.subject === 'string' &&
                    mongoose.Types.ObjectId.isValid(subjectTeacher.teacherId)
                )
            )
        ) {
            return res.status(400).json({ message: 'Invalid section or subjectTeachers format.' });
        }

        // Check if the schoolEmail exists in the School collection
        const school = await School.findOne({ schoolEmail });
        if (!school) {
            return res.status(404).json({ message: 'School with the provided email is not registered.' });
        }

        // Create and save the class with the school's email
        const newClass = new Class({
            className,
            subjects,
            sections,
            schoolEmail,
        });

        await newClass.save();
        res.status(201).json({ message: 'Class created successfully.', newClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the class.', error });
    }
};

// PUT /class/update/:id
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { schoolId, className, subjects, sections } = req.body;

        // Ensure schoolId is provided
        if (!schoolId) {
            return res.status(400).json({ message: 'SchoolId is required' });
        }

        // Validate the classId belongs to the correct school
        const existingClass = await Class.findOne({ _id: id, schoolId });
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found or belongs to a different school' });
        }

        // Update class details
        existingClass.className = className || existingClass.className;
        existingClass.subjects = subjects || existingClass.subjects;
        existingClass.sections = sections || existingClass.sections;

        await existingClass.save();

        res.status(200).json({
            success: true,
            message: 'Class updated successfully',
            updatedClass: existingClass,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update class' });
    }
};

// DELETE /class/delete/:id
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params; // Extract class ID from URL

        // Find and delete the class by ID
        const deletedClass = await Class.findByIdAndDelete(id);

        // Check if class was found and deleted
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
        const { schoolId } = req.body;

        // Ensure schoolId is provided
        if (!schoolId) {
            return res.status(400).json({ message: 'SchoolId is required' });
        }

        // Retrieve class and its timetable
        const classDetails = await Class.findOne({ _id: id, schoolId }).populate('timetable');
        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found or belongs to a different school' });
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
        const { schoolId } = req.body;

        // Ensure schoolId is provided
        if (!schoolId) {
            return res.status(400).json({ message: 'SchoolId is required' });
        }

        // Retrieve class and its attendance
        const classDetails = await Class.findOne({ _id: id, schoolId }).populate('attendance');
        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found or belongs to a different school' });
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
        const { classId, subjects, schoolId } = req.body;

        // Ensure schoolId is provided
        if (!schoolId) {
            return res.status(400).json({ message: 'SchoolId is required' });
        }

        // Check if class exists and belongs to the correct school
        const classDetails = await Class.findOne({ _id: classId, schoolId });
        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found or belongs to a different school' });
        }

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

// GET /classes/:schoolEmail
exports.getClassList = async (req, res) => {
    try {
        const { schoolEmail } = req.params;

        // Fetch all unique schoolEmails
        const allSchoolEmails = await Class.distinct('schoolEmail');
        console.log('All schoolEmails:', allSchoolEmails);

        // Check if school exists
        const school = await School.findOne({ schoolEmail });
        if (!school) {
            return res.status(404).json({ message: 'School with the provided email is not registered.' });
        }

        // Fetch classes for the school
        const classes = await Class.find({ schoolEmail })
            .populate({
                path: 'sections.subjectTeachers.teacherId',  // Correctly populate the teacherId
                model: 'Teacher',  // Ensure you're referencing the Teacher model
                select: 'name',  // Select the fields you want to return, for example, name
                match: { _id: { $ne: null } }
            });

        // Format and return the classes
        const formattedClasses = classes.map(classObj => {
            return {
                id: classObj._id,
                className: classObj.className,
                subjects: classObj.subjects,  // Just return the subjects as strings
                sections: classObj.sections.map(section => ({
                    sectionName: section.sectionName,
                    subjectTeachers: section.subjectTeachers.map(subjectTeacher => ({
                        subject: subjectTeacher.subject,
                        teacher: subjectTeacher.teacherId ? subjectTeacher.teacherId.name : null // Return teacher's name
                    }))
                })),
                schoolEmail: classObj.schoolEmail
            };
        });

        res.status(200).json({
            success: true,
            classes: formattedClasses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch class details' });
    }
};

