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


const multer = require("multer");


// ✅ 1️⃣ Set up Multer Storage (Uploads Folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); //
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// ✅ 2️⃣ Multer File Filter (सिर्फ इमेज फाइल्स अलाउ करें)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// ✅ 3️⃣ Multer Middleware
const upload = multer({ storage, fileFilter });

exports.updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, phone, address, city, state, gender, subject, classAllocated } = req.body;

        // ✅ टीचर को खोजें
        const existingTeacher = await Teacher.findById(id);
        if (!existingTeacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // ✅ अगर नई फ़ोटो अपलोड हुई है, तो पुरानी फ़ोटो को हटा दें
        if (req.file) {
            existingTeacher.photo = `/uploads/${req.file.filename}`;
        }

        // ✅ अन्य डिटेल्स अपडेट करें
        existingTeacher.name = name || existingTeacher.name;
        existingTeacher.dob = dob || existingTeacher.dob;
        existingTeacher.phone = phone || existingTeacher.phone;
        existingTeacher.address = address || existingTeacher.address;
        existingTeacher.city = city || existingTeacher.city;
        existingTeacher.state = state || existingTeacher.state;
        existingTeacher.gender = gender || existingTeacher.gender;
        existingTeacher.subject = subject || existingTeacher.subject;
        existingTeacher.classAllocated = classAllocated || existingTeacher.classAllocated;

        // ✅ अपडेटेड डेटा सेव करें
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



// ✅ 3️⃣ Multer File Filter (सिर्फ इमेज फाइल्स अलाउ करें)



// ✅ 5️⃣ Update Student Profile
exports.updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, phone, address, city, state, gender } = req.body;

        // ✅ स्टूडेंट को खोजें
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // ✅ अगर नई फ़ोटो अपलोड हुई है, तो पुरानी फ़ोटो को हटा दें
        if (req.file) {
            existingStudent.photo = `/uploads/${req.file.filename}`;
        }

        // ✅ अन्य डिटेल्स अपडेट करें
        existingStudent.name = name || existingStudent.name;
        existingStudent.dob = dob || existingStudent.dob;
        existingStudent.phone = phone || existingStudent.phone;
        existingStudent.address = address || existingStudent.address;
        existingStudent.city = city || existingStudent.city;
        existingStudent.state = state || existingStudent.state;
        existingStudent.gender = gender || existingStudent.gender;

        // ✅ अपडेटेड डेटा सेव करें
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