

const express = require("express");
const multer = require("multer");
const path = require("path");

// 📂 File Upload Configuration (Multer)
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const router = express.Router();
const upload = multer({ storage });





const {
    postCircular,
    getCircular,
    deleteCircular

} = require('../controller/circular_controller');
const authenticate = require('../middleware/authenticate');

// Routes

router.post('/circulars/uploads', authenticate, upload.array('attachments', 10), postCircular);

router.get("/get", authenticate, getCircular);

router.delete("/delete/:id", authenticate, deleteCircular);
module.exports = router;