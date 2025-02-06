const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

// Signup Route


// Signup Route
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with phone number
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            phone // Include phone number
        });
        await user.save();

        res.status(201).json({ success: true, userId: user._id });
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

        // Password Check
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: 0,
                message: 'Invalid password',
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const response = {
            success: 1,
            userRole: user.role,
            id: user.id,
            email: user.email,
            phone: user.phone,  // Include phone in the login response
            message: 'Login successful',
            token,
        };

        // Include schoolId if role is 'School'
        if (user.role === 'School') {
            response.schoolId = user.schoolId; // Assuming schoolId is a field in the User model
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