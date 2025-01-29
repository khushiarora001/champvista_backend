const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const app = express();
dotenv.config();

app.use(express.json());

// Routes
app.use('/auth', require('./routes/authroute'));
app.use('/dashboard', require('./routes/dashboard_route'));
app.use('/school', require('./routes/schoolroute'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
