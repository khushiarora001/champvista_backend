const School = require('../model/school');

// POST /school/add
exports.addSchool = async (req, res) => {
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
            state, password,
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
            !state || !password ||
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
        const { filter } = req.query; // Get filter from query params

        // Base query
        let query = {};

        // Apply filter based on the query parameter
        if (filter === "active") {
            query.planExpiry = { $gte: new Date() }; // Schools with future expiry dates
        } else if (filter === "expired") {
            query.planExpiry = { $lt: new Date() }; // Schools with past expiry dates
        }
        // Fetch filtered data
        const schools = await School.find(query).select(
            "name contact website affiliationNumber address city state pincode googleMapLink schoolEmail password planExpiry"
        );

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
