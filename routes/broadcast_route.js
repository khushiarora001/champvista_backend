const express = require('express');

const multer = require("multer");

const router = express.Router();
const {
    giveBroadCast,
    getBroadCastMessage
} = require('../controller/broadcastController');
const authenticate = require('../middleware/authenticate');

// Routes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/broadcastmessage', authenticate, upload.single('image'), giveBroadCast);
router.get('/getbroadcast/:classId', authenticate, getBroadCastMessage);

module.exports = router;
