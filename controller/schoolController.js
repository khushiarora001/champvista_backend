const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const School = require('../model/school');
const bcrypt = require('bcryptjs');
const User = require('../model/user')
const router = express.Router();
const jwt = require('jsonwebtoken');
const Teacher = require('../model/teacher');
const Students = require('../model/student');
// Middleware for parsing form-data and JSON with increased limits
router.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
router.use(bodyParser.json({ limit: '100mb' }));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `school_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB file size limit
});

// API Route to add a school

exports.addSchool = async (req, res) => {
    try {
        const {
            name,
            contact,
            website,
            affiliationNumber,
            address,
            city,
            state,
            password,
            pincode,
            googleMapLink,
            schoolEmail,
            planExpiry,
            imageUrl, // Base64 image data
        } = req.body;

        // Log the image data to check if it's coming through
        console.log("Received image data:", imageUrl);

        let savedImageUrl = imageUrl; // New variable for the processed image URL
        const existingUser = await User.findOne({ email: schoolEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Handle base64 image
        if (imageUrl) {
            const imagePath = path.join(__dirname, '../uploads', `school_${Date.now()}.jpg`);
            console.log("Saving image to path:", imagePath);
            saveBase64Image(imageUrl, imagePath); // Save base64 image to disk
            savedImageUrl = `/uploads/${path.basename(imagePath)}`;
        }

        // Create new school record and save it to the database
        const school = new School({
            name,
            contact,
            website,
            affiliationNumber,
            address,
            city,
            state,
            pincode,
            googleMapLink,
            schoolEmail,
            password,
            planExpiry: new Date(planExpiry),
            imageUrl: savedImageUrl, // Use the updated image URL
        });

        await school.save();

        // Hash password for the School user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the "School" user account
        const schoolUser = new User({
            name,
            email: schoolEmail,
            password: hashedPassword,
            role: 'School',
            schoolId: school._id, // Link user to the school
            phone: contact, // You can set the contact as phone
        });

        await schoolUser.save();

        // Generate JWT Token for the School user
        const token = jwt.sign(
            {
                id: schoolUser._id,
                role: schoolUser.role,
                email: schoolUser.email,
                phone: schoolUser.phone,
                schoolId: schoolUser.schoolId,
            },
            process.env.JWT_SECRET, // Secret key
            { expiresIn: '1h' }    // Token expiration time
        );

        res.status(201).json({
            success: true,
            schoolId: school._id,
            message: 'School added and School user account created successfully',
            imageUrl: savedImageUrl, // Return the correct image URL
            token, // Return JWT Token for authentication
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add school and create school user' });
    }
};
// Function to save base64 image
function saveBase64Image(base64Data, filePath) {
    const base64Image = base64Data.split(';base64,').pop();
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filePath, buffer);
}

// PUT /school/update/:id




exports.updateSchoolDetails = async (req, res) => {
    try {
        const { id } = req.params;
        let updates = req.body;
        console.log(updates);
        // Fetch the existing school details
        let school = await School.findById(id);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // If email is updated, check if it's unique
        if (updates.email && updates.email !== school.email) {
            const existingSchool = await School.findOne({ email: updates.email });
            if (existingSchool) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        // Check if the school has an associated user
        const user = await User.findOne({ email: school.schoolEmail }); // Fetch user using old emails
        if (!user) {
            return res.status(404).json({ message: 'Associated user not found' });
        }

        // If password is updated, hash it and update in User collection
        if (updates.password) {
            const hashedPassword = await bcrypt.hash(updates.password, 10);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        }

        // If email is updated, update it in User collection
        if (updates.schoolEmail) {
            console.log(updates.schoolEmail);

            await User.findByIdAndUpdate(user._id, { email: updates.schoolEmail });

        }

        // Update school details
        school = await School.findByIdAndUpdate(id, updates, { new: true });

        res.status(200).json({
            success: true,
            message: 'School details and login credentials updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update school details' });
    }
};



exports.deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;

        const school = await School.findByIdAndDelete(id);

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({
            success: true,
            message: 'School deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete school' });
    }
};

// POST /school/upload-logo
exports.uploadSchoolLogo = async (req, res) => {
    try {
        const { schoolId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const school = await School.findByIdAndUpdate(
            schoolId,
            { logo: imageUrl },
            { new: true }
        );

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({
            success: true,
            imageUrl,
            message: 'School logo uploaded successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload school logo' });
    }
};

exports.getSchoolList = async (req, res) => {
    const totalStudents = await Students.countDocuments();
    const totalSchools = await School.countDocuments();
    const totalTeachers = await School.countDocuments();
    try {
        const { filter } = req.query;

        let query = {};

        if (filter === "active") {
            query.planExpiry = { $gte: new Date() };
        } else if (filter === "expired") {
            query.planExpiry = { $lt: new Date() };
        }

        const schools = await School.aggregate([
            { $match: query },


            {
                $project: {
                    name: 1,
                    contact: 1,
                    website: 1,
                    affiliationNumber: 1,
                    address: 1,
                    city: 1,
                    state: 1,
                    pincode: 1,
                    password: 1,
                    googleMapLink: 1,
                    schoolEmail: 1,
                    planExpiry: 1,
                    imageUrl: "$imageUrl",

                }
            }
        ]);

        // Fetch student & teacher counts for each school
        for (let school of schools) {
            const schoolEmail = school.schoolEmail;
            const totalStudents = await Students.countDocuments({ schoolEmail: schoolEmail });
            const totalTeachers = await Teacher.countDocuments({ schoolEmail: schoolEmail });

            school.totalTeachers = totalTeachers;
            school.totalStudents = totalStudents;
        }


        res.status(200).json({
            schools,
            message: 'Schools fetched successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch schools' });
    }
};


// PUT /school/update-plan
exports.updatePlanExpiry = async (req, res) => {
    try {
        const { schoolId, expiryDate } = req.body;

        const school = await School.findByIdAndUpdate(
            schoolId,
            { planExpiry: expiryDate },
            { new: true }
        );

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Plan expiry date updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update plan expiry date' });
    }
};
