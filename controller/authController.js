const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const School = require('../model/school')
// Signup Route
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, phone, schoolId, assignedBy } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Only one Admin can exist
        if (role === 'Admin') {
            const existingAdmin = await User.findOne({ role: 'Admin' });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Only one admin can exist' });
            }
        }

        // School Role: Can sign up only if an Admin exists
        if (role === 'School') {
            const adminExists = await User.findOne({ role: 'Admin' });
            if (!adminExists) {
                return res.status(400).json({ message: 'A School can only be created after an Admin is registered' });
            }
        }

        // Teacher Role: Can sign up only after a school is created
        if (role === 'Teacher') {
            if (!schoolId) {
                return res.status(400).json({ message: 'School ID is required for Teacher registration' });
            }

            // Query the School collection to verify if the school exists
            const schoolExists = await School.findById(schoolId);
            if (!schoolExists) {
                return res.status(400).json({ message: 'School not found' });
            }
        }


        // Student Role: Can sign up only if assigned by a School/Teacher
        if (role === 'Student') {
            if (!assignedBy) {
                return res.status(400).json({ message: 'Student must be assigned by a School/Teacher' });
            }
            const assignedByUser = await User.findOne({ _id: assignedBy, role: { $in: ['School', 'Teacher'] } });
            if (!assignedByUser) {
                return res.status(400).json({ message: 'Invalid assigner (must be a School or Teacher)' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            schoolId,      // Store schoolId for teacher and student roles
            assignedBy     // Store the person assigning the student (for student role)
        });
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email,
                phone: user.phone,
                schoolId: user.schoolId, // Optional, based on role
                assignedBy: user.assignedBy // Optional, for student role
            },
            process.env.JWT_SECRET, // Secret key
            { expiresIn: '1h' }    // Token expiration time
        );

        res.status(201).json({
            success: true,
            message: 'User signed up successfully',
            userId: user._id,
            role: user.role,
            token,  // Provide the token in the response
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// Login Route
exports.login = async (req, res) => {
    try {
        console.log("🔍 Received Headers:", req.headers);
        console.log("🔍 Received Body:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: 0,
                message: 'Email and password are required',
                receivedBody: req.body,
            });
        }

        const user = await User.findOne({ email });

        console.log("User fetched:", user);
        if (!user) {
            return res.status(404).json({
                success: 0,
                message: 'User not found',
            });
        }

        console.log("🔍 Entered Password:", password);
        console.log("🔍 Stored Password:", user.password);

        // Password Check
        const validPassword = await bcrypt.compare(password, user.password);
        console.log("Password Match Status:", validPassword);

        if (!validPassword) {
            return res.status(401).json({
                success: 0,
                message: 'Invalid password',
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        response = {
            success: 1,
            userId: user._id,
            email: user.email,
            role: user.role,
            phone: user.phone,



            message: 'Login successful',
            token,
        };
        if (user.role === "School") {
            response.schoolId = user.schoolId;
        } else if (user.role === "Teacher") {
            response.teacherId = user._id;
            response.schoolId = user.schoolId;
        } else if (user.role === "Student") {
            response.schoolId = user.schoolId;
            response.assignedBy = user.assignedBy;
        }
        res.json(response);

    } catch (error) {
        console.error("🔥 Login Error:", error);
        res.status(500).json({
            success: 0,
            message: 'Server error during login',
            error: error.message,
        });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password matches
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};