const express = require('express');

const multer = require("multer");

const router = express.Router();
const {
    giveBroadCast,
    getBroadCastMessage
    , deleteBroadCastMessage
} = require('../controller/broadcastController');
const authenticate = require('../middleware/authenticate');

// Routes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/broadcastmessage', authenticate, upload.single('image'), giveBroadCast);
router.get('/getbroadcast', authenticate, getBroadCastMessage);

router.delete('/deleteBroadCastMessage/:messageId', authenticate, deleteBroadCastMessage);

module.exports = router;
