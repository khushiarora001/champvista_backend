const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = express();

const cors = require('cors');


// Enable CORS for all routes
app.use(cors());
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/authroute'));  // Auth routes
app.use('/dashboard', require('./routes/dashboard_route'));  // Dashboard routes
app.use('/school', require('./routes/schoolroute'));  // School routes
app.use('/teacher', require('./routes/teacher_routes'));  // Teacher routes
app.use('/student', require('./routes/studentroute'));  // Student routes
app.use('/calendar', require('./routes/calendar_route'));  // Calendar routes
app.use('/class', require('./routes/class_routes'));  // Class routes
app.use('/leave', require('./routes/leave_routes'));  // Leave routes

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
