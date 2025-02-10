// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const username = encodeURIComponent("officebackend24");
const password = encodeURIComponent("k4TNZMo9WEe81x6j");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds for connection
            socketTimeoutMS: 45000,

        });
        console.log('Successfully connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
