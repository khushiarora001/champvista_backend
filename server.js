const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();


app.use(cors({
    origin: ['https://www-champvista-com.onrender.com', 'http://localhost:3000'],  // Specify the frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Include necessary headers
    // If you're sending cookies or auth headers
}));

// Handle preflight OPTIONS request
app.options('*', cors());

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// ✅ CORS Middleware


// ✅ JSON Middleware (MUST BE HERE)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // ✅ For form-urlencoded data

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
