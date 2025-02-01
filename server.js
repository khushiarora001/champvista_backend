const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();


const corsOptions = {
    origin: "https://www-champvista-com.onrender.com", // Change to your Flutter web URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));
app.options("*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://www-champvista-com.onrender.com");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // Important for auth
    res.status(204).end();
});
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
