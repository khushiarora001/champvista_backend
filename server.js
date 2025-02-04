const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            "https://www-champvista-com.onrender.com", // Flutter Web URL
            // Add other domains if required in the future
        ];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
    credentials: true,  // To allow cookies (Authorization header)
};

// Use CORS Middleware
app.use(cors(corsOptions));

// Preflight OPTIONS request handling
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://www-champvista-com.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Important for Auth token
    res.status(204).end();
});

// ✅ JSON Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For form-urlencoded data

// Routes
app.use('/auth', require('./routes/authroute'));
app.use('/dashboard', require('./routes/dashboard_route'));
app.use('/school', require('./routes/schoolroute'));
app.use('/teacher', require('./routes/teacher_routes'));
app.use('/student', require('./routes/studentroute'));
app.use('/calendar', require('./routes/calendar_route'));
app.use('/class', require('./routes/class_routes'));
app.use('/leave', require('./routes/leave_routes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
