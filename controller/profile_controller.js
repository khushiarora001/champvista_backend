const Teacher = require('../model/teacher');
const Student = require("../model/student");

// ✅ Get Teacher Profile
exports.getTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Teacher ID:", id);

        const teacher = await Teacher.findById(id);
        console.log("Fetched Teacher:", teacher); // Debugging Line

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        res.status(200).json({
            success: true,
            message: "Teacher profile fetched successfully",
            data: {
                name: teacher.name,
                dob: teacher.dob,
                phone: teacher.phone,
                address: teacher.address,
                city: teacher.city,
                state: teacher.state,
                gender: teacher.gender,
                photo: teacher.photo,
                subject: teacher.subject,
                classAllocated: teacher.classAllocated
            }
        });
    } catch (error) {
        console.error("Error fetching teacher profile:", error); // Debugging Line
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


exports.updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, phone, address, city, state, gender, photo, subject, classAllocated } = req.body;

        // Find teacher before updating
        const existingTeacher = await Teacher.findById(id);
        if (!existingTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Update fields only if they are provided in req.body
        existingTeacher.name = name || existingTeacher.name;
        existingTeacher.dob = dob || existingTeacher.dob;
        existingTeacher.phone = phone || existingTeacher.phone;
        existingTeacher.address = address || existingTeacher.address;
        existingTeacher.city = city || existingTeacher.city;
        existingTeacher.state = state || existingTeacher.state;
        existingTeacher.gender = gender || existingTeacher.gender;
        existingTeacher.photo = photo || existingTeacher.photo;
        existingTeacher.subject = subject || existingTeacher.subject;
        existingTeacher.classAllocated = classAllocated || existingTeacher.classAllocated;

        // Save updated teacher
        await existingTeacher.save();

        res.status(200).json({
            success: true,
            message: "Teacher profile updated successfully",
            data: existingTeacher
        });
    } catch (error) {
        console.error("Error updating teacher profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
exports.getStudentProfileByEmail = async (req, res) => {
    try {
        const { email } = req.params; // Extract email from request parameters
        const student = await Student.findOne({ email }); // Find student by email

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            message: "Student profile fetched successfully",
            data: {
                name: student.name,
                dob: student.dob,
                phone: student.phoneNumber, // Fixed key to match schema
                classId: student.classId,
                sectionId: student.sectionId,
                schoolId: student.schoolId,
                address: student.address,
                city: student.city,
                state: student.state,
                gender: student.gender,
                photo: student.imageUrl, // Fixed to match the stored image field
                className: student.className, // Ensure populated or available in schema
                sectionName: student.sectionName, // Ensure populated or available in schema
            }
        });
    } catch (error) {
        console.error("🔥 Error fetching student profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// ✅ Update Student Profile
exports.updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, phone, address, city, state, gender, photo } = req.body;

        // Find student before updating
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Update fields only if they are provided in req.body
        existingStudent.name = name || existingStudent.name;
        existingStudent.dob = dob || existingStudent.dob;
        existingStudent.phone = phone || existingStudent.phone;
        existingStudent.address = address || existingStudent.address;
        existingStudent.city = city || existingStudent.city;
        existingStudent.state = state || existingStudent.state;
        existingStudent.gender = gender || existingStudent.gender;
        existingStudent.photo = photo || existingStudent.photo;

        // Save updated student
        await existingStudent.save();

        res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            data: existingStudent
        });
    } catch (error) {
        console.error("Error updating student profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
