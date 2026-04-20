const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
    getMaterials, 
    getMaterialById,
    getAdminMaterials, 
    uploadMaterial, 
    updateMaterial,
    updateMaterialStatus, 
    deleteMaterial,
    rateMaterial,
    reactMaterial,
    downloadMaterial
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware');

// Ensure upload directory exists
const uploadDir = 'uploads/materials';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/materials');
    },
    filename: (req, file, cb) => {
        cb(null, `material-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB Limit
});

// --- Routes ---
router.get('/', getMaterials);
router.get('/admin', protect, admin, getAdminMaterials);
router.get('/:id', getMaterialById); // New Detail Route

router.post('/upload', protect, admin, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'additionalFiles', maxCount: 10 }]), uploadMaterial);

router.put('/:id', protect, admin, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'additionalFiles', maxCount: 10 }]), updateMaterial);

router.put('/:id/status', protect, admin, updateMaterialStatus);
router.delete('/:id', protect, admin, deleteMaterial);

// Student/User Interactions
router.post('/:id/rate', protect, rateMaterial);
router.post('/:id/react', protect, reactMaterial);
router.post('/:id/download', downloadMaterial);

module.exports = router;
