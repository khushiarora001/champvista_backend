const jwt = require('jsonwebtoken');

// Define authenticate function
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token
        if (!token) {
            return res.status(401).json({ message: 'Authorization token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded payload to req.user
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Token is not valid' });
    }
};

// Export the authenticate function
module.exports = authenticate;
