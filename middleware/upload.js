const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer to store uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Store in uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, `school_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

