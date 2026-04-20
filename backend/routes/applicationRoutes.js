const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
    applyForInternship, 
    getPartnerApplications, 
    getMyApplications, 
    updateApplicationStatus 
} = require('../controllers/applicationController');
const { protect, partner, adminOrPartner } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = 'uploads/cv';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/cv');
    },
    filename: (req, file, cb) => {
        cb(null, `cv-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File Filtering (Allow only PDF)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// --- Routes ---
router.post('/apply', protect, upload.single('cv'), applyForInternship);
router.get('/partner', protect, partner, getPartnerApplications);
router.get('/my', protect, getMyApplications);
router.put('/:id/status', protect, adminOrPartner, updateApplicationStatus);

module.exports = router;
