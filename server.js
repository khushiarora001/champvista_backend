const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();


app.use(cors({
    origin: 'https://www-champvista-com.onrender.com',  // ✅ Sirf frontend ka URL allow karein
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // ✅ Extra headers hata dein
    credentials: true,
}));

// ✅ Preflight request ka sahi response
app.options('*', (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://www-champvista-com.onrender.com");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.sendStatus(204);
});

// ✅ Route Example (Ensure headers are sent properly)
app.post('/auth/login', (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://www-champvista-com.onrender.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.json({ message: "Login Successful" });
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
