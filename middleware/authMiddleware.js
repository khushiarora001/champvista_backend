const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];  // Token ko extract karte hain
        if (!token) {
            return res.status(401).json({ message: 'Authorization token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Decoded payload ko req.user mein attach karte hain
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Token is not valid' });
    }
};
