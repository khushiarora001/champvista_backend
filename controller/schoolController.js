const School = require('../model/school');
const multer = require('multer');
// Multer storage configuration for handling image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Folder to save the uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);  // Naming the file
    },
});

const upload = multer({ storage });  // Multer middleware

// POST /school/add with image upload
exports.addSchool = upload.single('image'), async (req, res) => {
    try {
        // Check if the user role is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

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
        } = req.body;

        // Check if all required fields are provided
        if (
            !name ||
            !contact ||
            !website ||
            !affiliationNumber ||
            !address ||
            !city ||
            !state ||
            !password ||
            !pincode ||
            !googleMapLink ||
            !schoolEmail ||
            !planExpiry
        ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate the plan expiry date
        const expiryDate = new Date(planExpiry);
        if (isNaN(expiryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid plan expiry date' });
        }

        // Handle image upload
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;  // Construct the image URL

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
            image: imageUrl,  // Store image URL in the database
            planExpiry: expiryDate,
        });

        await school.save();

        res.status(201).json({
            success: true,
            schoolId: school._id,
            message: 'School added successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add school' });
    }
};
// GET /school/search
exports.searchSchool = async (req, res) => {
    try {
        const { query } = req.query;

        const schoolList = await School.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } },
            ],
        });

        res.status(200).json({
            schoolList,
            message: 'Schools fetched successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to search schools' });
    }
};

// PUT /school/update/:id
exports.updateSchoolDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const school = await School.findByIdAndUpdate(id, updates, { new: true });

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({
            success: true,
            message: 'School details updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update school details' });
    }
};
exports.deleteSchool = async (req, res) => {
    try {
        // Check if the user role is Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

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

// GET /school/:id

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
// Controller method to get the list of schools
// Correct Controller Method for Listing Schools
exports.getSchoolList = async (req, res) => {
    try {
        const { filter } = req.query;

        let query = {};

        if (filter === "active") {
            query.planExpiry = { $gte: new Date() };
        } else if (filter === "expired") {
            query.planExpiry = { $lt: new Date() };
        }

        const schools = await School.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'teachers',  // Assuming 'teachers' is the collection name for Teacher model
                    localField: '_id',
                    foreignField: 'schoolId',  // Ensure the Teacher model has a reference to School
                    as: 'teachers'
                }
            },
            {
                $lookup: {
                    from: 'students',  // Assuming 'students' is the collection name for Student model
                    localField: '_id',
                    foreignField: 'schoolId',
                    as: 'students'
                }
            },
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
                    googleMapLink: 1,
                    schoolEmail: 1,
                    planExpiry: 1,
                    image: 1,
                    teacherCount: { $size: '$teachers' },
                    studentCount: { $size: '$students' }
                }
            }
        ]);

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
