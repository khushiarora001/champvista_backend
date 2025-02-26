const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

////CORS Configuration
// const corsOptions = {
//     origin: function (origin, callback) {
//         const allowedOrigins = [
//             "http://localhost:50163",
//             "http://localhost:57723",
//             "http://localhost:3000",  // ✅ React/Flutter Web (Local)
//             "http://127.0.0.1:3000",  // ✅ Alternative localhost IP
//             "https://www-champvista-com.onrender.com",  // ✅ Production URL
//         ];
//         if (allowedOrigins.includes(origin) || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
//     credentials: true,  // To allow cookies (Authorization header)
// };

// //Use CORS Middleware
// app.use(cors(corsOptions));

// //Preflight OPTIONS request handling
// app.options('*', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true'); // Important for Auth token
//     res.status(204).end();
// });

// ✅ JSON Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For form-urlencoded data
const listEndpoints = require('express-list-endpoints');
// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', require('./routes/authroute'));
app.use('/dashboard', require('./routes/dashboard_route'));
app.use('/school', require('./routes/schoolroute'));
app.use('/class', require('./routes/class_routes'));

console.log(listEndpoints(app));
app.use('/profile', require('./routes/profile_route'))

app.use('/teacher', require('./routes/teacher_routes'));
app.use('/student', require('./routes/studentroute'));
console.log(listEndpoints(app));
app.use('/calendar', require('./routes/calendar_route'));
app.use('/fee', require('./routes/fee_route'));
app.use('/broadcast', require('./routes/broadcast_route'));
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
