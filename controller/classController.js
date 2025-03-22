const Class = require('../model/class');
const Teacher = require('../model/teacher');
const Subject = require('../model/subject');
const School = require("../model/school");
const mongoose = require('mongoose');

const Timetable = require("../model/timetable")
exports.addClass = async (req, res) => {
    try {
        const { className, subjects, sections, schoolEmail } = req.body;

        if (!className || !Array.isArray(subjects) || !Array.isArray(sections) || !schoolEmail) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const school = await School.findOne({ schoolEmail });
        if (!school) {
            return res.status(404).json({ message: "School not registered." });
        }

        // ✅ Collect teachers from subjects
        const subjectTeacherIds = subjects.map(subject => subject.teacherId).filter(id => mongoose.Types.ObjectId.isValid(id));

        // ✅ Collect teachers from sections
        const sectionTeacherIds = sections.flatMap(section => section.subjectTeachers.map(teacher => teacher.teacherId))
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        // ✅ Merge unique teacher IDs
        const allTeachers = [...new Set([...subjectTeacherIds, ...sectionTeacherIds])].filter(id => mongoose.Types.ObjectId.isValid(id));

        console.log("✅ Final Allocated Teachers List:", allTeachers); // 🔹 Debugging ke liye

        // ✅ Create Class with allocatedTeachers
        const newClass = new Class({ className, subjects, sections, schoolEmail, allocatedTeachers: allTeachers });
        await newClass.save();

        // ✅ Update Teachers' classAllocated
        if (allTeachers.length > 0) {
            const updateResult = await Teacher.updateMany(
                { _id: { $in: allTeachers } },
                { $addToSet: { classAllocated: newClass._id } }
            );
            console.log("✅ Teachers Updated:", updateResult); // 🔹 Debugging ke liye
        }

        // ✅ Fetch Updated Data
        const updatedClass = await Class.findById(newClass._id).populate("allocatedTeachers", "name email");

        const updatedTeachers = await Teacher.updateMany(
            { _id: { $in: allTeachers } }, // ✅ Update all selected teachers
            { $addToSet: { classAllocated: newClass._id } },  // ✅ Add class ID without duplicates
            { new: true }
        );


        console.log("✅ Updated Class Data:", updatedClass); // 🔹 Debugging ke liye

        res.status(201).json({
            message: "Class created successfully.",
            classData: updatedClass,
            teachers: updatedTeachers
        });
    } catch (error) {
        console.error("❌ Error adding class:", error);
        res.status(500).json({ message: "An error occurred.", error });
    }
}
// Class ka model import kar

// 🔹 Example Usage



// PUT /class/update/:id
// PUT /class/update/:id
exports.updateClass = async (req, res) => {
    try {
        const { schoolEmail, classId, className, subjects, sections } = req.body;

        if (!schoolEmail || !classId) {
            return res.status(400).json({ message: 'SchoolEmail and ClassId are required' });
        }

        const existingClass = await Class.findOne({ _id: classId, schoolEmail });
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found or belongs to a different school' });
        }

        // **Purane allocated teachers ka list**
        const oldTeacherIds = new Set(existingClass.allocatedTeachers.map(id => id.toString()));

        // **Update class details**
        if (className) existingClass.className = className;
        if (subjects) existingClass.subjects = subjects;

        let newTeacherIds = new Set();
        if (sections) {
            existingClass.sections = sections.map(newSection => {
                const existingSection = existingClass.sections.find(sec => sec.sectionName === newSection.sectionName);

                if (existingSection) {
                    existingSection.classTeacher = newSection.classTeacher || existingSection.classTeacher; // ✅ **Class Teacher Update**

                    existingSection.subjectTeachers = newSection.subjectTeachers.map(newTeacher => {
                        const existingTeacher = existingSection.subjectTeachers.find(
                            teacher => teacher.subject === newTeacher.subject
                        );

                        if (existingTeacher) {
                            existingTeacher.teacherId = newTeacher.teacherId;
                            newTeacherIds.add(newTeacher.teacherId);
                            return existingTeacher;
                        } else {
                            newTeacherIds.add(newTeacher.teacherId);
                            return newTeacher;
                        }
                    });

                    newTeacherIds.add(existingSection.classTeacher); // ✅ **Class Teacher ko bhi add karo**
                    return existingSection;
                } else {
                    newSection.subjectTeachers.forEach(t => newTeacherIds.add(t.teacherId));
                    newTeacherIds.add(newSection.classTeacher); // ✅ **Class Teacher Add**
                    return newSection;
                }
            });
        }

        // ✅ **Allocated Teachers Update**
        const allTeachers = [...new Set([...newTeacherIds])].filter(id => mongoose.Types.ObjectId.isValid(id));
        existingClass.allocatedTeachers = allTeachers;

        await existingClass.save();
        console.log("✅ Updated Teachers List:", allTeachers);

        // ✅ **Identify added & removed teachers**
        const addedTeachers = allTeachers.filter(id => !oldTeacherIds.has(id.toString()));
        const removedTeachers = [...oldTeacherIds].filter(id => !allTeachers.includes(id));

        // ✅ **Update Teachers Collection**
        await Teacher.updateMany(
            { _id: { $in: addedTeachers } },
            { $addToSet: { classAllocated: classId } }
        );

        await Teacher.updateMany(
            { _id: { $in: removedTeachers } },
            { $pull: { classAllocated: classId } }
        );

        res.status(200).json({
            success: true,
            message: 'Class updated successfully with teachers',
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
        const { classId } = req.params;
        // SchoolId validate karne ke liye

        console.log(classId);
        const classDetails = await Class.findOne({ _id: classId });
        if (!classDetails) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // **Teachers ke `classAllocated` array se class ka ID remove karo**
        const teacherIds = classDetails.subjects.map(sub => sub.teacherId);
        for (const teacherId of teacherIds) {
            const teacher = await Teacher.findById(teacherId);
            if (teacher) {
                teacher.classAllocated = teacher.classAllocated.filter(id => id.toString() !== classId);
                await teacher.save();
            }
        }

        // ✅ **Class delete karo**
        await Class.findByIdAndDelete(classId);

        res.status(200).json({ success: true, message: 'Class deleted and removed from teachers' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete class' });
    }
};


exports.getTeacherAllocations = async (req, res) => {
    try {
        const { teacherId } = req.params;
        console.log("🔹 Teacher ID Received:", teacherId);

        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });
        }

        // Fetch teacher details (including name)
        const teacher = await Teacher.findOne({ _id: teacherId }).select("name _id");
        console.log("👨‍🏫 Teacher Found:", teacher);

        if (!teacher) {
            return res.status(404).json({ message: "No teacher found with this ID" });
        }

        const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

        // Fetch classes where the teacher is allocated
        const classes = await Class.find({
            "sections.subjectTeachers.teacherId": teacherObjectId,
        })
            .populate("sections.classTeacher", "name _id") // ✅ Populate classTeacher name
            .populate("sections.subjectTeachers.teacherId", "name _id") // ✅ Populate subject teacher name
            .lean();

        console.log("✅ Classes Found:", classes);

        if (!classes.length) {
            return res.status(404).json({ message: "No classes found for this teacher" });
        }

        // Modify sections to include teacherName
        const updatedClasses = classes.map(classItem => ({
            ...classItem,
            sections: classItem.sections.map(section => ({
                ...section,
                classTeacher: section.classTeacher?._id.toString() || null,
                classTeacherName: section.classTeacher?.name || null, // ✅ Add class teacher name
                subjectTeachers: section.subjectTeachers.map(subjectTeacher => ({
                    ...subjectTeacher,
                    teacherId: subjectTeacher.teacherId?._id.toString() || null,
                    teacherName: subjectTeacher.teacherId?.name || null, // ✅ Add subject teacher name
                })),
            })),
        }));

        // Send response with teacher name and classes
        res.status(200).json({
            success: true,
            message: "Fetch successfully",
            teacher: {
                id: teacher._id,
                name: teacher.name
            },
            classes: updatedClasses
        });

    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};



exports.getclassbyschool = async (req, res) => {
    try {
        const classes = await Class.find({ schoolEmail: req.params.schoolEmail }).lean();

        if (!classes.length) {
            return res.status(404).json({ message: "No classes found for this school" });
        }

        // Formatting the data as required
        const formattedData = classes.map((cls) => ({
            id: cls._id,
            name: cls.className,
            sections: cls.sections.map((section) => ({
                id: section._id,
                name: section.sectionName,
            })),
        }));

        res.status(200).json({
            success: true,
            message: "Fetch successfully",
            class:
                formattedData
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};


exports.createTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;
        const { timetableData } = req.body;

        console.log("🟡 Received request to create timetable for:", { classId, sectionId });

        // Validate inputs


        if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
            return res.status(400).json({ success: false, message: "Invalid class/section ID" });
        }

        // 🔥 Check if class & section exist
        let sectionExists;
        const classExists = await Class.findOne({ _id: classId });

        if (!classExists) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        // ✅ Agar sections array ke andar stored hain (Class Model me hi)
        if (classExists.sections && classExists.sections.some(sec => sec._id.toString() === sectionId)) {
            sectionExists = true;
        }

        // ✅ Agar Section ek alag model hai
        if (!sectionExists) {
            sectionExists = await Section.findOne({ _id: sectionId, classId });
        }

        if (!sectionExists) {
            return res.status(404).json({ success: false, message: "Section not found" });
        }

        console.log("✅ Class & Section found:", classExists.name);
        console.log(timetableData);
        // ✅ Create or update timetable
        const updatedTimetable = await Timetable.findOneAndUpdate(
            { classId, sectionId },
            { classId, sectionId, timetable: timetableData },
            { new: true, upsert: true }
        );

        res.status(201).json({
            success: true,
            message: "Timetable created/updated successfully",
            timetable: updatedTimetable
        });

    } catch (error) {
        console.error("🔥 Error creating timetable:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create timetable",
            error: error.message
        });
    }
};

exports.viewTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;

        console.log("📌 Fetching timetable for:", { classId, sectionId });

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
            return res.status(400).json({ success: false, message: "Invalid class/section ID" });
        }

        // Fetch timetable
        const timetable = await Timetable.findOne({ classId, sectionId }).select("-__v -createdAt -updatedAt");

        if (!timetable) {
            return res.status(404).json({ success: false, message: "Timetable not found" });
        }

        res.status(200).json({
            success: true,
            message: "Timetable fetched successfully",
            timetable: timetable.timetable
        });

    } catch (error) {
        console.error("🔥 Error fetching timetable:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch timetable",
            error: error.message
        });
    }
};

exports.updateTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;
        const { timetableData } = req.body;

        console.log("🟡 Updating timetable for:", { classId, sectionId });

        // Validate input
        if (!timetableData || typeof timetableData !== "object") {
            return res.status(400).json({ success: false, message: "Invalid timetable data" });
        }

        if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
            return res.status(400).json({ success: false, message: "Invalid class/section ID" });
        }

        // Find and update the timetable (upsert: true to create if it doesn't exist)
        const updatedTimetable = await Timetable.findOneAndUpdate(
            { classId, sectionId },
            { classId, sectionId, timetable: timetableData },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Timetable updated successfully",
            timetable: updatedTimetable
        });

    } catch (error) {
        console.error("🔥 Error updating timetable:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update timetable",
            error: error.message
        });
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

        console.log("Fetching school with email:", schoolEmail);

        // Check if school exists
        const school = await School.findOne({ schoolEmail: schoolEmail });
        if (!school) {
            return res.status(404).json({ message: 'School with the provided email is not registered.' });
        }

        console.log("School found:", school);

        // Fetch classes for the school
        const classes = await Class.find({ schoolEmail })
            .populate({
                path: 'sections.classTeacher',
                select: 'name',
            })
            .populate({
                path: 'sections.subjectTeachers.teacherId',
                select: 'name',
            })
            .populate({
                path: 'sections.sectionName',
                select: 'name',
            })
            ;

        console.log("Classes found:", classes);

        // Format and return the classes
        const formattedClasses = classes.map(classObj => ({
            id: classObj._id,
            className: classObj.className,
            subjects: classObj.subjects,
            sections: classObj.sections.map(section => ({
                classTeacher: section.classTeacher?.name ?? "N/A",
                classTeacherID: section.classTeacher?._id ?? "N/A",
                sectionName: section.sectionName,
                sectionId: section._id ?? 'N/A',
                subjectTeachers: section.subjectTeachers.map(subjectTeacher => ({
                    teacherID: subjectTeacher.teacherId?._id ?? null,
                    subject: subjectTeacher.subject,
                    teacher: subjectTeacher.teacherId?.name ?? null
                }))
            })),
            schoolEmail: classObj.schoolEmail
        }));

        res.status(200).json({
            success: true,
            classes: formattedClasses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch class details', error: error.message });
    }
};



exports.deleteTimetable = async (req, res) => {
    try {
        const { classId, sectionId } = req.params;

        console.log("🗑️ Deleting timetable for:", { classId, sectionId });

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
            return res.status(400).json({ success: false, message: "Invalid class/section ID" });
        }

        // Find and delete the timetable
        const deletedTimetable = await Timetable.findOneAndDelete({ classId, sectionId });

        if (!deletedTimetable) {
            return res.status(404).json({ success: false, message: "Timetable not found" });
        }

        res.status(200).json({
            success: true,
            message: "Timetable deleted successfully"
        });

    } catch (error) {
        console.error("🔥 Error deleting timetable:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete timetable",
            error: error.message
        });
    }
};
